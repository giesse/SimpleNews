from fastapi import Depends, FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
import time
import uuid
import asyncio
import requests

from . import llm_interface, crud, models, schemas, scraping
from .database import SessionLocal, engine
from .shared_state import job_statuses, canceled_jobs

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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


def run_scraping_job(job_id: str, db: Session = None, source_id: int | None = None):
    """
    The actual scraping logic that runs in the background.
    """
    start_time = time.time()

    if db is None:
        db = SessionLocal()

    print(f"JOB {job_id}: Starting.")
    job_statuses[job_id] = schemas.JobStatus(
        id=job_id, status="pending", progress=0, message="Initializing..."
    )

    try:
        sources = crud.get_sources(db) if source_id is None else [crud.get_source(db, source_id)]
        if not sources or sources[0] is None:
            raise HTTPException(status_code=404, detail="Source not found")

        total_sources = len(sources)
        print(f"JOB {job_id}: Found {total_sources} sources.")

        # --- Pre-computation Step ---
        # First, get all article links to calculate a true total for progress tracking
        all_articles_to_scrape = []
        for i, source in enumerate(sources):
            print(f"JOB {job_id}: Pre-scanning source {i+1}/{total_sources}: {source.name}")
            article_links = scraping.get_article_links(source)
            for link in article_links:
                # Avoid adding duplicates from the same run
                if link not in [l for _, l in all_articles_to_scrape]:
                    all_articles_to_scrape.append((source, link))
        
        total_articles = len(all_articles_to_scrape)
        print(f"JOB {job_id}: Found a total of {total_articles} new articles to scrape across {total_sources} sources.")

        processed_articles_count = 0

        # --- Progress Update Callback ---
        def update_progress(articles_processed_in_source=0):
            nonlocal processed_articles_count
            processed_articles_count += articles_processed_in_source

            progress = int((processed_articles_count / total_articles) * 100) if total_articles > 0 else 0
            
            elapsed_time = time.time() - start_time
            eta_seconds = (elapsed_time / processed_articles_count) * (total_articles - processed_articles_count) if processed_articles_count > 0 else -1.0

            job_statuses[job_id].progress = progress
            job_statuses[job_id].total_articles = total_articles
            job_statuses[job_id].processed_articles = processed_articles_count
            job_statuses[job_id].eta_seconds = eta_seconds
            job_statuses[job_id].message = f"Scraped {processed_articles_count}/{total_articles} articles..."


        job_statuses[job_id].status = "in_progress"
        job_statuses[job_id].total_sources = total_sources

        # --- Main Processing Loop ---
        for i, source in enumerate(sources):
            job_statuses[job_id].processed_sources = i
            job_statuses[job_id].message = f"Processing source {i+1}/{total_sources}: {source.name}"

            # Check for cancellation before processing each source
            if job_id in canceled_jobs:
                print(f"JOB {job_id}: Cancellation detected. Terminating.")
                job_statuses[job_id].status = "canceled"
                job_statuses[job_id].message = "Job canceled by user."
                canceled_jobs.remove(job_id)
                return

            # Get the links for the current source that were pre-scanned
            links_for_current_source = [link for s, link in all_articles_to_scrape if s.id == source.id]

            canceled = scraping.scrape_source(
                db=db, 
                source=source, 
                job_id=job_id, 
                article_links=links_for_current_source,
                update_progress_callback=update_progress
            )

            if canceled:
                if job_id in canceled_jobs:
                    print(f"JOB {job_id}: Cancellation confirmed. Terminating.")
                    job_statuses[job_id].status = "canceled"
                    job_statuses[job_id].message = "Job canceled by user."
                    canceled_jobs.remove(job_id)
                return
            
            print(f"JOB {job_id}: Finished scrape for source: {source.name}")

        print(f"JOB {job_id}: All sources processed. Completing job.")
        job_statuses[job_id] = schemas.JobStatus(
            id=job_id, status="completed", progress=100, message="Scraping complete!"
        )

    except Exception as e:
        print(f"JOB {job_id}: An error occurred: {e}")
        job_statuses[job_id] = schemas.JobStatus(
            id=job_id, status="failed", progress=0, message=f"An error occurred: {e}"
        )
    finally:
        print(f"JOB {job_id}: Closing database session.")
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


@app.patch("/articles/{article_id}/read-status", response_model=schemas.Article)
def mark_article_read_status(
    article_id: int, read_status: schemas.ArticleReadStatus, db: Session = Depends(get_db)
):
    db_article = crud.mark_article_read(db, article_id=article_id, read=read_status.read)
    if db_article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return db_article


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


@app.post("/sources/{source_id}/scrape", response_model=schemas.ScrapeJob, status_code=202)
def scrape_source(source_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_source = crud.get_source(db, source_id=source_id)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")

    job_id = str(uuid.uuid4())
    background_tasks.add_task(run_scraping_job, job_id, db, source_id=source_id)
    return schemas.ScrapeJob(job_id=job_id, message="Scraping job initiated for single source")


@app.post("/sources/scrape", response_model=schemas.ScrapeJob, status_code=202)
def scrape_all_sources(background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    background_tasks.add_task(run_scraping_job, job_id)
    return schemas.ScrapeJob(job_id=job_id, message="Scraping job initiated")


@app.get("/sources/scrape/status/{job_id}", response_model=schemas.JobStatus)
def get_scrape_job_status(job_id: str):
    status = job_statuses.get(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status


@app.post("/sources/scrape/cancel/{job_id}", status_code=200)
def cancel_scrape_job(job_id: str):
    if job_id not in job_statuses or job_statuses[job_id].status not in [
        "in_progress",
        "pending",
    ]:
        raise HTTPException(
            status_code=404, detail="Job not found or cannot be canceled."
        )
    canceled_jobs.add(job_id)
    return {"message": "Scraping job cancellation requested."}


@app.get("/categories/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db)):
    categories = crud.get_categories(db)
    return categories


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


@app.post(
    "/articles/recalculate-scores", response_model=schemas.ScrapeJob, status_code=202
)
def recalculate_all_article_scores(
    background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    """
    Recalculate interest scores for all articles.
    This is a long-running task, so it runs in the background.
    """
    job_id = str(uuid.uuid4())
    job_statuses[job_id] = schemas.JobStatus(
        id=job_id,
        status="pending",
        progress=0,
        message="Initializing score recalculation...",
    )

    background_tasks.add_task(run_article_scoring_job, job_id, db)

    return schemas.ScrapeJob(job_id=job_id, message="Article scoring job initiated")


async def run_article_scoring_job(job_id: str, db: Session):
    """
    Background task that recalculates interest scores for all articles.
    """
    job_statuses[job_id] = schemas.JobStatus(
        id=job_id,
        status="in_progress",
        progress=0,
        message="Starting article scoring...",
    )

    try:
        # Get all articles
        articles = crud.get_articles(db)
        total_articles = len(articles)
        interest_prompt = crud.get_interest_prompt(db)

        for i, article in enumerate(articles):
            # Update progress
            progress = int(((i + 1) / total_articles) * 100)
            job_statuses[job_id] = schemas.JobStatus(
                id=job_id,
                status="in_progress",
                progress=progress,
                message=f"Scoring article {i+1} of {total_articles}...",
            )

            # Calculate score
            interest_score = llm_interface.generate_interest_score(
                article_text=article.original_content,
                user_interest_prompt=interest_prompt,
            )

            # Update article in DB
            crud.update_article_interest_score(
                db, article_id=article.id, interest_score=interest_score
            )

            # Yield control periodically
            if i % 5 == 0:  # Every 5 articles
                await asyncio.sleep(0.1)

        job_statuses[job_id] = schemas.JobStatus(
            id=job_id,
            status="completed",
            progress=100,
            message=f"Successfully scored {total_articles} articles!",
        )

    except Exception as e:
        job_statuses[job_id] = schemas.JobStatus(
            id=job_id, status="failed", progress=0, message=f"An error occurred: {e}"
        )
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"Hello": "World"}
