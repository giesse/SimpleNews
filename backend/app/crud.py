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
        source_id=article.source_id,
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


def update_article_summary(db: Session, article_id: int, summary: str):
    db_article = (
        db.query(models.Article).filter(models.Article.id == article_id).first()
    )
    if db_article:
        db_article.summary = summary
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
    return db_article


def update_article_interest_score(db: Session, article_id: int, interest_score: int):
    """
    Updates the interest score for an article.

    Args:
        db: Database session
        article_id: ID of the article to update
        interest_score: Interest score (0-100) to assign to the article

    Returns:
        The updated article or None if article not found
    """
    db_article = (
        db.query(models.Article).filter(models.Article.id == article_id).first()
    )
    if db_article:
        db_article.interest_score = interest_score
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
    return db_article


def link_categories_to_article(db: Session, article_id: int, categories: List[str]):
    db_article = (
        db.query(models.Article).filter(models.Article.id == article_id).first()
    )
    if not db_article:
        return None

    for category_name in categories:
        db_category = (
            db.query(models.Category)
            .filter(models.Category.name == category_name)
            .first()
        )
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


def mark_article_read(db: Session, article_id: int, read: bool):
    """
    Mark an article as read or unread.

    Args:
        db: Database session
        article_id: ID of the article to update
        read: Boolean indicating the read status

    Returns:
        The updated article or None if not found
    """
    db_article = get_article(db, article_id)
    if db_article:
        db_article.read = read
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
    return db_article


def create_source(db: Session, source: schemas.SourceCreate):
    db_source = models.Source(**source.model_dump())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


def get_setting(db: Session, key: str):
    """
    Get a setting value by its key.

    Args:
        db: Database session
        key: Setting key to look up

    Returns:
        The setting or None if not found
    """
    return db.query(models.Settings).filter(models.Settings.key == key).first()


def get_interest_prompt(db: Session) -> str:
    """
    Get the global interest prompt, or return a default if not set.

    Args:
        db: Database session

    Returns:
        The interest prompt string
    """
    setting = get_setting(db, "interest_prompt")
    if setting and setting.value:
        return setting.value

    # Default interest prompt if none is set
    return """
    I am interested in technology, especially artificial intelligence and its applications.
    I enjoy reading about software development, programming languages, and best practices.
    I also like articles about science, particularly physics and space exploration.
    I am not interested in celebrity gossip or sports news.
    """


def set_setting(db: Session, key: str, value: str):
    """
    Set a setting value. Creates it if it doesn't exist.

    Args:
        db: Database session
        key: Setting key
        value: Setting value

    Returns:
        The created or updated setting
    """
    db_setting = get_setting(db, key)
    if db_setting:
        db_setting.value = value
    else:
        db_setting = models.Settings(key=key, value=value)

    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting


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

def get_categories(db: Session) -> List[models.Category]:
    """Get all categories."""
    return db.query(models.Category).all()
