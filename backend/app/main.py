from fastapi import Depends, FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
import uuid
import asyncio
import requests

from . import llm_interface, crud, models, schemas, scraping
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# In-memory store for job statuses
job_statuses: Dict[str, schemas.JobStatus] = {}

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def run_scraping_job(job_id: str, db: Session):
    """
    The actual scraping logic that runs in the background.
    """
    job_statuses[job_id] = schemas.JobStatus(
        id=job_id, status="in_progress", progress=0, message="Initializing..."
    )

    try:
        sources = crud.get_sources(db)
        total_sources = len(sources)

        for i, source in enumerate(sources):
            progress = int(((i + 1) / total_sources) * 100)
            job_statuses[job_id] = schemas.JobStatus(
                id=job_id,
                status="in_progress",
                progress=progress,
                message=f"Scraping {source.name}...",
            )
            scraping.scrape_source(db=db, source=source)
            await asyncio.sleep(1)  # Yield control to the event loop

        job_statuses[job_id] = schemas.JobStatus(
            id=job_id, status="completed", progress=100, message="Scraping complete!"
        )

    except Exception as e:
        job_statuses[job_id] = schemas.JobStatus(
            id=job_id, status="failed", progress=0, message=f"An error occurred: {e}"
        )
    finally:
        db.close()


@app.post("/articles/", response_model=schemas.Article)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    return crud.create_article(db=db, article=article)


@app.get("/articles/", response_model=List[schemas.Article])
def read_articles(
    skip: int = 0, limit: int = 100, min_score: int = 0, db: Session = Depends(get_db)
):
    articles = crud.get_articles(db, skip=skip, limit=limit)
    # Filter by minimum interest score if provided
    if min_score > 0:
        articles = [
            article
            for article in articles
            if article.interest_score and article.interest_score >= min_score
        ]
    # Sort articles by interest score (highest first)
    articles.sort(key=lambda x: (x.interest_score or 0), reverse=True)
    return articles


@app.post("/articles/{article_id}/process", status_code=200)
def process_article(article_id: int, db: Session = Depends(get_db)):
    db_article = crud.get_article(db, article_id=article_id)
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Call the new LLM interface
    summary, categories = llm_interface.generate_summary_and_categories(
        article_text=db_article.original_content
    )

    if not summary:
        raise HTTPException(
            status_code=500, detail="Failed to process article with LLM"
        )

    # Save the enriched data back to the database
    crud.update_article_summary(db, article_id=article_id, summary=summary)
    crud.link_categories_to_article(db, article_id=article_id, categories=categories)

    return {"message": "Article processed successfully", "article_id": article_id}


@app.post("/sources/", response_model=schemas.Source)
def create_source(source: schemas.SourceCreate, db: Session = Depends(get_db)):
    # If scraper_type is not provided or is "Auto", default to "HTML"
    if source.scraper_type is None or source.scraper_type == "Auto":
        source.scraper_type = "HTML"
    return crud.create_source(db=db, source=source)


@app.get("/sources/", response_model=List[schemas.Source])
def read_sources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sources = crud.get_sources(db, skip=skip, limit=limit)
    return sources


@app.get("/sources/{source_id}", response_model=schemas.Source)
def read_source(source_id: int, db: Session = Depends(get_db)):
    db_source = crud.get_source(db, source_id=source_id)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return db_source


@app.put("/sources/{source_id}", response_model=schemas.Source)
def update_source(
    source_id: int, source: schemas.SourceUpdate, db: Session = Depends(get_db)
):
    db_source = crud.update_source(db, source_id=source_id, source=source)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return db_source


@app.delete("/sources/{source_id}", response_model=schemas.Source)
def delete_source(source_id: int, db: Session = Depends(get_db)):
    db_source = crud.delete_source(db, source_id=source_id)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return db_source


@app.post("/sources/{source_id}/scrape", status_code=200)
def scrape_source(source_id: int, db: Session = Depends(get_db)):
    db_source = crud.get_source(db, source_id=source_id)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return scraping.scrape_source(db=db, source=db_source)


@app.post("/sources/scrape", response_model=schemas.ScrapeJob, status_code=202)
def scrape_all_sources(
    background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    job_id = str(uuid.uuid4())
    background_tasks.add_task(run_scraping_job, job_id, db)
    return schemas.ScrapeJob(job_id=job_id, message="Scraping job initiated")


@app.get("/sources/scrape/status/{job_id}", response_model=schemas.JobStatus)
def get_scrape_job_status(job_id: str):
    status = job_statuses.get(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status


@app.post("/sources/autodetect-selector", response_model=dict)
def autodetect_selector(source: schemas.SourceBase):
    # Fetch the content with requests
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    }
    try:
        response = requests.get(source.url, headers=headers, timeout=10)
        response.raise_for_status()
        content = response.text
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch URL: {e}")

    selector = llm_interface.find_article_link_selector(content)
    if not selector:
        raise HTTPException(status_code=500, detail="Failed to detect selector.")
    return {"selector": selector}


@app.get("/settings/interest_prompt", response_model=dict)
def get_interest_prompt(db: Session = Depends(get_db)):
    """Get the current interest prompt setting"""
    prompt = crud.get_interest_prompt(db)
    return {"interest_prompt": prompt}


@app.put("/settings/interest_prompt", response_model=dict)
def update_interest_prompt(prompt_data: dict, db: Session = Depends(get_db)):
    """Update the interest prompt setting"""
    if "interest_prompt" not in prompt_data:
        raise HTTPException(status_code=400, detail="interest_prompt field is required")

    prompt = prompt_data["interest_prompt"]
    crud.set_setting(db, "interest_prompt", prompt)
    return {
        "message": "Interest prompt updated successfully",
        "interest_prompt": prompt,
    }


@app.post("/articles/{article_id}/score", response_model=dict)
def calculate_article_score(article_id: int, db: Session = Depends(get_db)):
    """Calculate or recalculate the interest score for a specific article"""
    db_article = crud.get_article(db, article_id=article_id)
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")

    interest_prompt = crud.get_interest_prompt(db)
    interest_score = llm_interface.generate_interest_score(
        article_text=db_article.original_content, user_interest_prompt=interest_prompt
    )

    crud.update_article_interest_score(
        db, article_id=article_id, interest_score=interest_score
    )
    return {
        "message": "Article scored successfully",
        "article_id": article_id,
        "interest_score": interest_score,
    }


@app.get("/")
def read_root():
    return {"Hello": "World"}
