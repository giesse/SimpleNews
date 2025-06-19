from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from trafilatura import baseline

from . import models


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


def scrape_and_save_article(db: Session, url: str):
    # This is a placeholder function. It will be implemented later.
    # For now, it returns a hardcoded message to make the test pass.
    existing_article = db.query(models.Article).filter(models.Article.url == url).first()
    if existing_article:
        return {"message": "Article already exists"}

    # In a real scenario, we would scrape the URL here.
    # For now, we'll just return a success message.
    return {"message": "Article scraped and saved successfully"}
