from pydantic import BaseModel
import datetime


class ArticleBase(BaseModel):
    url: str
    title: str
    original_content: str | None = None
    summary: str | None = None


class ArticleCreate(ArticleBase):
    pass


class Article(ArticleBase):
    id: int
    source_id: int
    created_at: datetime.datetime

    model_config = {"from_attributes": True}
