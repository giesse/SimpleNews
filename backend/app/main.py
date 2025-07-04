from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import llm_interface, crud, models, schemas, scraping
from .database import SessionLocal, engine

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


@app.post("/articles/", response_model=schemas.Article)
def create_article(article: schemas.ArticleCreate, db: Session = Depends(get_db)):
    return crud.create_article(db=db, article=article)


@app.get("/articles/", response_model=List[schemas.Article])
def read_articles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    articles = crud.get_articles(db, skip=skip, limit=limit)
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
        raise HTTPException(status_code=500, detail="Failed to process article with LLM")

    # Save the enriched data back to the database
    crud.update_article_summary(db, article_id=article_id, summary=summary)
    crud.link_categories_to_article(db, article_id=article_id, categories=categories)

    return {"message": "Article processed successfully", "article_id": article_id}


@app.post("/sources/", response_model=schemas.Source)
def create_source(source: schemas.SourceCreate, db: Session = Depends(get_db)):
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
def update_source(source_id: int, source: schemas.SourceUpdate, db: Session = Depends(get_db)):
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


@app.post("/sources/scrape", status_code=200)
def scrape_all_sources(db: Session = Depends(get_db)):
    sources = crud.get_sources(db)
    for source in sources:
        scraping.scrape_source(db=db, source=source)
    return {"message": "Scraping all sources initiated."}


@app.get("/")
def read_root():
    return {"Hello": "World"}
