import datetime
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from trafilatura import baseline

from . import crud, models, schemas


def scrape_html(html_content: str) -> dict:
    """
    Scrapes the title and text from HTML content.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    title = soup.title.string if soup.title else ""
    # baseline returns a tuple, we only want the text
    baseline_result = baseline(html_content)
    text = baseline_result[1] if baseline_result else ""
    return {"title": title, "text": text}


def scrape_source(db: Session, source: models.Source):
    """
    Creates a dummy article for a given source.
    """
    # For now, we'll just create a dummy article to prove the concept
    article_create = schemas.ArticleCreate(
        title=f"Dummy Article from {source.name}",
        url=f"http://example.com/articles/{source.id}/{datetime.datetime.utcnow().timestamp()}",
        original_content="This is a dummy article.",
        summary="This is a dummy summary.",
        source_id=source.id,
    )
    crud.create_article(db=db, article=article_create)
    return {"message": f"Scraped {source.name} and created a dummy article."}
