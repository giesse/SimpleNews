import datetime
import requests
from urllib.parse import urljoin
from collections import OrderedDict

from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from trafilatura import extract

from . import crud, models, schemas, llm_interface
from .shared_state import canceled_jobs, job_statuses


def get_article_links(source: models.Source) -> list[str]:
    """
    Fetches the article links from a source without processing them.
    Returns a list of article URLs.
    """
    config = source.config or {}
    article_link_selector = config.get("article_link_selector")

    if not article_link_selector:
        print(f"Skipping source {source.name}: 'article_link_selector' not configured.")
        return []

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    }
    try:
        response = requests.get(source.url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching source URL {source.url}: {e}")
        return []

    soup = BeautifulSoup(response.text, "lxml")
    links = soup.select(article_link_selector)
    
    article_urls = []
    for link in links:
        href = link.get("href")
        if not href:
            continue
        article_urls.append(urljoin(source.url, href))
    
    return article_urls


def scrape_html(html_content: str) -> dict:
    """
    Scrapes the title and text from HTML content using BeautifulSoup and Trafilatura.
    """
    soup = BeautifulSoup(html_content, "lxml")
    title = soup.title.string.strip() if soup.title else "No Title Found"

    # Use Trafilatura to extract the main content of the article, favoring precision
    text = extract(
        html_content,
        include_comments=False,
        include_tables=False,
        favor_precision=True,
    )

    if text:
        # Remove duplicate lines while preserving order to handle trafilatura's output quirks
        lines = text.strip().split("\n")
        unique_lines = list(OrderedDict.fromkeys(lines))
        text = "\n".join(unique_lines)

    return {"title": title, "text": text or ""}


def _scrape_article_content(url: str) -> dict | None:
    """
    Fetches an article's HTML and scrapes its content.
    Returns a dict with title and content, or None if fetching fails.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return scrape_html(response.text)
    except requests.RequestException as e:
        print(f"Error fetching article content from {url}: {e}")
        return None


def _scrape_html_source(db: Session, source: models.Source, job_id: str | None = None, article_links: list[str] = None, update_progress_callback: callable = None) -> bool:
    """
    Scraping strategy for a standard HTML source. It finds article links
    based on a CSS selector and scrapes each one.
    Returns True if the job was canceled, False otherwise.
    """
    print(f"Scraping HTML source: {source.name}")

    processed_articles = 0
    for link in article_links:
        if job_id and job_id in canceled_jobs:
            print(f"JOB {job_id}: Cancellation detected in scraping loop for source {source.name}. Stopping.")
            return True
        
        # 1. Check for duplicates
        if crud.get_article_by_url(db, url=link):
            print(f"Skipping duplicate article: {link}")
            continue

        # 2. Scrape the full article content
        print(f"Scraping new article: {link}")
        scraped_data = _scrape_article_content(link)
        if not scraped_data:
            continue

        # 3. Create the article in the database
        article_create = schemas.ArticleCreate(
            title=scraped_data["title"],
            url=link,
            original_content=scraped_data["text"],
            source_id=source.id,
            summary=None,
        )
        db_article = crud.create_article(db=db, article=article_create)
        print(f"Successfully saved article: {scraped_data['title']}")

        # 4. Process the article with LLM for summary and categories
        print(f"Processing article with LLM: {scraped_data['title']}")
        summary, categories = llm_interface.generate_summary_and_categories(
            article_text=scraped_data["text"]
        )

        if summary:
            crud.update_article_summary(db, article_id=db_article.id, summary=summary)
        if categories:
            crud.link_categories_to_article(
                db, article_id=db_article.id, categories=categories
            )

        # 5. Generate interest score
        interest_prompt = crud.get_interest_prompt(db)
        interest_score = llm_interface.generate_interest_score(
            article_text=scraped_data["text"], user_interest_prompt=interest_prompt
        )
        crud.update_article_interest_score(
            db, article_id=db_article.id, interest_score=interest_score
        )
        print(
            f"Successfully generated interest score for article: {scraped_data['title']}"
        )
        print(f"Successfully processed article with LLM: {scraped_data['title']}")

        processed_articles += 1
        if update_progress_callback:
            update_progress_callback(1)

    return False


def scrape_source(db: Session, source: models.Source, job_id: str | None = None, article_links: list[str] = None, update_progress_callback: callable = None) -> bool:
    """
    Dispatcher function to select and run the correct scraping strategy.
    Returns True if the job was canceled, False otherwise.
    """
    scraper_type = source.scraper_type
    print(f"Initiating scrape for source '{source.name}' with type '{scraper_type}'")

    if scraper_type == "HTML":
        canceled = _scrape_html_source(db, source, job_id=job_id, article_links=article_links, update_progress_callback=update_progress_callback)
        if canceled:
            return True
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

    return False
