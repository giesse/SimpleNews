from sqlalchemy.orm import Session

from . import models, schemas


def get_article_by_url(db: Session, url: str):
    return db.query(models.Article).filter(models.Article.url == url).first()


def get_articles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Article).offset(skip).limit(limit).all()


def create_article(db: Session, article: schemas.ArticleCreate):
    db_article = models.Article(
        url=article.url,
        title=article.title,
        original_content=article.original_content,
        summary=article.summary,
        # This assumes source_id is handled elsewhere or not required for creation
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article