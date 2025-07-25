import time
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import requests_mock

from app.main import app, run_scraping_job
from app.models import Source, Article
from app.database import SessionLocal
from app.shared_state import job_statuses, canceled_jobs
import app.scraping as scraping

client = TestClient(app)


def test_scrape_job_progress_and_completion(db: Session, requests_mock: requests_mock.Mocker):
    """
    Tests that the scraping job progresses through sources and completes successfully.
    """
    # 1. Create a source
    source = Source(
        name="Test Progress Source",
        url="http://test.com",
        scraper_type="HTML",
        config={"article_link_selector": ".article-link"},
    )
    db.add(source)
    db.commit()

    # 2. Mock the HTML pages
    requests_mock.get("http://test.com", text='''
        <a class="article-link" href="/article1">Article 1</a>
    ''')
    requests_mock.get("http://test.com/article1", text='''
        <html><head><title>Article 1</title></head><body>Content</body></html>
    ''')

    # 3. Mock the LLM interface
    with patch("app.llm_interface.generate_summary_and_categories", return_value=("S", ["C"])), \
         patch("app.llm_interface.generate_interest_score", return_value=50):

        # 4. Start the scraping job directly
        job_id = "test-progress-job"
        run_scraping_job(job_id, db)

        # 5. Check the final status
        status = job_statuses.get(job_id)
        assert status is not None
        assert status.status == "completed"
        assert status.progress == 100

        # 6. Verify article was created
        articles = db.query(Article).all()
        assert len(articles) == 1
        assert articles[0].title == "Article 1"


def test_scrape_job_cancellation(db: Session, requests_mock: requests_mock.Mocker):
    """
    Tests that a running scraping job can be canceled mid-source.
    """
    # 1. Setup a source with many articles
    source_url = "http://longtest.com"
    article_urls = [f"{source_url}/article{i}" for i in range(5)]
    links_html = "".join(f'<a class="article-link" href="{url}"></a>' for url in article_urls)
    requests_mock.get(source_url, text=f"<html><body>{links_html}</body></html>")
    for url in article_urls:
        requests_mock.get(url, text="<html><head><title>Title</title></head><body>Content</body></html>")

    source = Source(
        name="Long Scraping Source",
        url=source_url,
        scraper_type="HTML",
        config={"article_link_selector": ".article-link"},
    )
    db.add(source)
    db.commit()

    # 2. Use a mock for _scrape_html_source that cancels the job partway through
    job_id = "test-cancel-job"
    
    original_scrape_html_source = scraping._scrape_html_source

    def cancellable_scrape_html_source(db, source, job_id, article_links, update_progress_callback=None):
        # Process one article, then set the job to canceled
        canceled_jobs.add(job_id)
        return original_scrape_html_source(db, source, job_id, article_links, update_progress_callback)

    with patch("app.scraping._scrape_html_source", side_effect=cancellable_scrape_html_source) as mock_scrape:
        # 3. Start the job
        run_scraping_job(job_id, db)

        # 4. Check the final status
        status = job_statuses.get(job_id)
        assert status is not None
        assert status.status == "canceled"

        # 5. Verify that not all articles were created
        article_count = db.query(Article).count()
        assert article_count < 5


def test_scrape_job_with_skipped_and_failed_articles(db: Session, requests_mock: requests_mock.Mocker):
    """
    Tests that the scraping job correctly tracks processed, skipped, and failed articles.
    """
    # 1. Create a source and a pre-existing article to simulate a duplicate
    source = Source(
        name="Test Skipped/Failed Source",
        url="http://test-mixed.com",
        scraper_type="HTML",
        config={"article_link_selector": ".article-link"},
    )
    db.add(source)
    db.commit()

    existing_article = Article(
        source_id=source.id,
        url="http://test-mixed.com/article-duplicate",
        title="Duplicate Article",
        original_content="This article already exists.",
    )
    db.add(existing_article)
    db.commit()

    # 2. Mock the HTML pages
    requests_mock.get("http://test-mixed.com", text='''
        <a class="article-link" href="/article-success">Successful Article</a>
        <a class="article-link" href="/article-duplicate">Duplicate Article</a>
        <a class="article-link" href="/article-failure">Failed Article</a>
    ''')
    requests_mock.get("http://test-mixed.com/article-success", text='''
        <html><head><title>Successful Article</title></head><body>Content</body></html>
    ''')
    requests_mock.get("http://test-mixed.com/article-duplicate", text='''
        <html><head><title>Duplicate Article</title></head><body>Content</body></html>
    ''')
    # The "failed" article will return a 500 error
    requests_mock.get("http://test-mixed.com/article-failure", status_code=500)

    # 3. Mock the LLM interface
    with patch("app.llm_interface.generate_summary_and_categories", return_value=("S", ["C"])):
        # 4. Start the scraping job
        job_id = "test-mixed-job"
        run_scraping_job(job_id, db)

        # 5. Check the final status
        status = job_statuses.get(job_id)
        assert status is not None
        assert status.status == "completed"
        assert status.total_articles == 3
        assert status.processed_articles == 1
        assert status.skipped_articles == 1
        assert status.failed_articles == 1
        assert status.progress == 100
