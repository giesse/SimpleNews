from pydantic import BaseModel
from typing import Dict, Any, Literal
import datetime

# Job status values: in_progress, completed, failed
JobStatusType = Literal["pending", "in_progress", "completed", "failed"]


class ScrapeJob(BaseModel):
    job_id: str
    message: str


class JobStatus(BaseModel):
    id: str
    status: Literal["pending", "in_progress", "completed", "failed", "canceled"]
    progress: int
    message: str
    total_sources: int = 0
    processed_sources: int = 0
    total_articles: int = 0
    processed_articles: int = 0
    skipped_articles: int = 0
    failed_articles: int = 0
    eta_seconds: float = -1.0


class ArticleBase(BaseModel):
    url: str
    title: str
    original_content: str | None = None
    summary: str | None = None
    interest_score: int | None = None
    read: bool = False


class ArticleCreate(ArticleBase):
    source_id: int
    summary: str | None = None
    interest_score: int | None = None


class Category(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class Article(ArticleBase):
    id: int
    source_id: int
    created_at: datetime.datetime
    read: bool
    interest_score: int | None = None
    categories: list[Category] = []

    model_config = {"from_attributes": True}


class ArticleReadStatus(BaseModel):
    read: bool


class SourceBase(BaseModel):
    name: str
    url: str
    scraper_type: str | None = None
    config: Dict[str, Any] | None = None


class SourceCreate(SourceBase):
    pass


class SourceUpdate(SourceBase):
    name: str | None = None
    url: str | None = None
    scraper_type: str | None = None
    config: Dict[str, Any] | None = None


class Source(SourceBase):
    id: int
    last_scraped_at: datetime.datetime | None = None
    scraper_type: str | None = None
    config: Dict[str, Any] | None = None

    model_config = {"from_attributes": True}
