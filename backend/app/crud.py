from typing import List
from sqlalchemy.orm import Session

from . import models, schemas


def get_article_by_url(db: Session, url: str):
    return db.query(models.Article).filter(models.Article.url == url).first()


def get_articles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Article).offset(skip).limit(limit).all()


def get_article(db: Session, article_id: int):
    return db.query(models.Article).filter(models.Article.id == article_id).first()


def create_article(db: Session, article: schemas.ArticleCreate):
    db_article = models.Article(
        url=article.url,
        title=article.title,
        original_content=article.original_content,
        summary=article.summary,
        # This assumes source_id is handled elsewhere or not required
        # for creation
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


def update_article_summary(db: Session, article_id: int, summary: str):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if db_article:
        db_article.summary = summary
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
    return db_article


def link_categories_to_article(db: Session, article_id: int, categories: List[str]):
    db_article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not db_article:
        return None

    for category_name in categories:
        db_category = db.query(models.Category).filter(models.Category.name == category_name).first()
        if not db_category:
            db_category = models.Category(name=category_name)
            db.add(db_category)
            db.commit()
            db.refresh(db_category)

        # This check is implicitly handled by the relationship, but for explicit clarity:
        if db_category not in db_article.categories:
            db_article.categories.append(db_category)
    db.commit()
    db.refresh(db_article)  # Refresh the article to reflect new categories
    return db_article


def create_source(db: Session, source: schemas.SourceCreate):
    db_source = models.Source(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


def get_source(db: Session, source_id: int):
    return db.query(models.Source).filter(models.Source.id == source_id).first()


def get_sources(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Source).offset(skip).limit(limit).all()


def update_source(db: Session, source_id: int, source: schemas.SourceUpdate):
    db_source = get_source(db, source_id)
    if db_source:
        update_data = source.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_source, key, value)
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
    return db_source


def delete_source(db: Session, source_id: int):
    db_source = get_source(db, source_id)
    if db_source:
        db.delete(db_source)
        db.commit()
    return db_source
