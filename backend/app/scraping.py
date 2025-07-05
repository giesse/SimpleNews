import datetime
import requests
from urllib.parse import urljoin
from collections import OrderedDict

from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from trafilatura import extract

from . import crud, models, schemas


def scrape_html(html_content: str) -> dict:
    """
    Scrapes the title and text from HTML content using BeautifulSoup and Trafilatura.
    """
    soup = BeautifulSoup(html_content, "lxml")
    title = soup.title.string if soup.title else "No Title Found"

    # Use Trafilatura to extract the main content of the article, favoring precision
    text = extract(
        html_content,
        include_comments=False,
        include_tables=False,
        favor_precision=True,
    )

    if text:
        # Remove duplicate lines while preserving order to handle trafilatura's output quirks
        lines = text.strip().split('\n')
        unique_lines = list(OrderedDict.fromkeys(lines))
        text = "\n".join(unique_lines)

    return {"title": title, "text": text or ""}


def _scrape_article_content(url: str) -> dict | None:
    """
    Fetches an article's HTML and scrapes its content.
    Returns a dict with title and content, or None if fetching fails.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return scrape_html(response.text)
    except requests.RequestException as e:
        print(f"Error fetching article content from {url}: {e}")
        return None


def _scrape_html_source(db: Session, source: models.Source):
    """
    Scraping strategy for a standard HTML source. It finds article links
    based on a CSS selector and scrapes each one.
    """
    print(f"Scraping HTML source: {source.name}")
    config = source.config or {}
    article_link_selector = config.get("article_link_selector")

    if not article_link_selector:
        print(f"Skipping source {source.name}: 'article_link_selector' not configured.")
        return

    try:
        response = requests.get(source.url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching source URL {source.url}: {e}")
        return

    soup = BeautifulSoup(response.text, "lxml")
    links = soup.select(article_link_selector)
    print(f"Found {len(links)} potential article links for {source.name}.")

    for link in links:
        href = link.get("href")
        if not href:
            continue

        article_url = urljoin(source.url, href)

        # 1. Check for duplicates
        if crud.get_article_by_url(db, url=article_url):
            print(f"Skipping duplicate article: {article_url}")
            continue

        # 2. Scrape the full article content
        print(f"Scraping new article: {article_url}")
        scraped_data = _scrape_article_content(article_url)
        if not scraped_data:
            continue

        # 3. Create the article in the database
        article_create = schemas.ArticleCreate(
            title=scraped_data["title"],
            url=article_url,
            original_content=scraped_data["text"],
            source_id=source.id,
            summary=None,
        )
        crud.create_article(db=db, article=article_create)
        print(f"Successfully saved article: {scraped_data['title']}")


def scrape_source(db: Session, source: models.Source):
    """
    Dispatcher function to select and run the correct scraping strategy.
    """
    scraper_type = source.scraper_type
    print(f"Initiating scrape for source '{source.name}' with type '{scraper_type}'")

    if scraper_type == "HTML":
        _scrape_html_source(db, source)
    else:
        print(f"Unknown or unsupported scraper type: {scraper_type}")
        # In the future, we could have more strategies here
        # elif scraper_type == "RSS":
        #     _scrape_rss_source(db, source)
        # elif scraper_type == "API_JSON":
        #     _scrape_json_api_source(db, source)

    # Update the last_scraped_at timestamp
    source.last_scraped_at = datetime.datetime.utcnow()
    db.add(source)
    db.commit()

    return {"message": f"Scraping process completed for {source.name}."}
