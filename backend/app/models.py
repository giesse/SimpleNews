from sqlalchemy import (
    Column,
    JSON,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import relationship
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

article_categories = Table(
    "article_categories",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    interest_prompt = Column(Text)
    interactions = relationship("UserArticleInteraction", back_populates="user")


class Source(Base):
    __tablename__ = "sources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    last_scraped_at = Column(DateTime)
    scraper_type = Column(String, nullable=True)
    config = Column(JSON, nullable=True)
    articles = relationship("Article", back_populates="source")


class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"))
    url = Column(String, unique=True, index=True)
    title = Column(String)
    original_content = Column(Text)
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    source = relationship("Source", back_populates="articles")
    interactions = relationship("UserArticleInteraction", back_populates="article")
    categories = relationship(
        "Category", secondary=article_categories, back_populates="articles"
    )


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    articles = relationship(
        "Article", secondary=article_categories, back_populates="categories"
    )


class UserArticleInteraction(Base):
    __tablename__ = "user_article_interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    article_id = Column(Integer, ForeignKey("articles.id"))
    liked = Column(Boolean)
    question = Column(Text)
    user = relationship("User", back_populates="interactions")
    article = relationship("Article", back_populates="interactions")
