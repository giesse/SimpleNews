from pydantic import BaseModel
from typing import Dict, Any, Literal
import datetime

# Job status values: in_progress, completed, failed
JobStatusType = Literal["in_progress", "completed", "failed"]


class ScrapeJob(BaseModel):
    job_id: str
    message: str


class JobStatus(BaseModel):
    id: str
    status: JobStatusType
    progress: int
    message: str


class ArticleBase(BaseModel):
    url: str
    title: str
    original_content: str | None = None
    summary: str | None = None
    interest_score: int | None = None


class ArticleCreate(ArticleBase):
    source_id: int
    summary: str | None = None
    interest_score: int | None = None


class Article(ArticleBase):
    id: int
    source_id: int
    created_at: datetime.datetime
    interest_score: int | None = None

    model_config = {"from_attributes": True}


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
