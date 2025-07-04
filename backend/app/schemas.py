from pydantic import BaseModel
import datetime


class ArticleBase(BaseModel):
    url: str
    title: str
    original_content: str | None = None
    summary: str | None = None


class ArticleCreate(ArticleBase):
    source_id: int


class Article(ArticleBase):
    id: int
    source_id: int
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class SourceBase(BaseModel):
    name: str
    url: str


class SourceCreate(SourceBase):
    pass


class SourceUpdate(SourceBase):
    name: str | None = None
    url: str | None = None


class Source(SourceBase):
    id: int
    last_scraped_at: datetime.datetime | None = None

    model_config = {"from_attributes": True}
