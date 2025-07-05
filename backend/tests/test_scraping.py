from sqlalchemy.orm import Session
import requests_mock

from app.models import Article, Source
from app.scraping import scrape_html, scrape_source


def test_scrape_html():
    """
    Tests the scraping of a mock HTML page.
    """
    mock_html = """
    <html>
        <head>
            <title>Test Page</title>
        </head>
        <body>
            <h1>Main Heading</h1>
            <p>This is the main content.</p>
        </body>
    </html>
    """

    expected_content = {
        "title": "Test Page",
        "text": "This is the main content."
    }

    scraped_content = scrape_html(mock_html)

    assert scraped_content == expected_content


def test_scrape_with_trafilatura():
    """
    Tests that trafilatura extracts the main content from a sample HTML page.
    """
    mock_html = """
    <html>
        <head>
            <title>Test Page</title>
        </head>
        <body>
            <header>
                <p>This is the header/boilerplate.</p>
            </header>
            <main>
                <h1>Main Article</h1>
                <p>This is the main content of the article.</p>
            </main>
            <footer>
                <p>This is the footer/boilerplate.</p>
            </footer>
        </body>
    </html>
    """

    expected_text = "Main Article\nThis is the main content of the article."

    scraped_content = scrape_html(mock_html)

    # Compare stripped versions to avoid issues with trailing whitespace
    assert scraped_content["text"].strip() == expected_text.strip()


def test_scrape_source_html(db: Session, requests_mock: requests_mock.Mocker):
    """
    Tests the full HTML scraping process for a source.
    """
    # 1. Mock the HTML pages
    source_url = "http://test.com"
    article1_url = "http://test.com/article1"
    article2_url = "http://test.com/article2"

    mock_homepage_html = f"""
    <html>
        <body>
            <a class="article-link" href="{article1_url}">Article 1</a>
            <a class="article-link" href="{article2_url}">Article 2</a>
        </body>
    </html>
    """
    mock_article1_html = """
    <html><head><title>Article 1 Title</title></head>
    <body><p>Article 1 content.</p></body></html>
    """
    mock_article2_html = """
    <html><head><title>Article 2 Title</title></head>
    <body><p>Article 2 content.</p></body></html>
    """

    requests_mock.get(source_url, text=mock_homepage_html)
    requests_mock.get(article1_url, text=mock_article1_html)
    requests_mock.get(article2_url, text=mock_article2_html)

    # 2. Create a source with the HTML scraper type and config
    source = Source(
        name="Test HTML Source",
        url=source_url,
        scraper_type="HTML",
        config={"article_link_selector": ".article-link"}
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    # 3. Run the scraper
    scrape_source(db, source)

    # 4. Assert that two new articles were created
    articles = db.query(Article).all()
    assert len(articles) == 2
    assert articles[0].title == "Article 1 Title"
    assert articles[0].original_content == "Article 1 content."
    assert articles[1].title == "Article 2 Title"
    assert articles[1].original_content == "Article 2 content."


def test_scraper_ignores_duplicate_url(db: Session, requests_mock: requests_mock.Mocker):
    """
    Tests that the scraper does not create a new article if the URL already exists.
    """
    # 1. Mock the HTML pages
    source_url = "http://test.com"
    article1_url = "http://test.com/article1"  # This one already exists
    article2_url = "http://test.com/article2"  # This one is new

    mock_homepage_html = f"""
    <html>
        <body>
            <a class="article-link" href="{article1_url}">Article 1</a>
            <a class="article-link" href="{article2_url}">Article 2</a>
        </body>
    </html>
    """
    mock_article2_html = """
    <html><head><title>Article 2 Title</title></head>
    <body><p>Article 2 content.</p></body></html>
    """

    requests_mock.get(source_url, text=mock_homepage_html)
    requests_mock.get(article2_url, text=mock_article2_html)

    # 2. Pre-create one article in the database
    existing_article = Article(
        title="Existing Article",
        url=article1_url,
        original_content="Old content",
        source_id=1  # dummy id
    )
    db.add(existing_article)
    db.commit()

    # 3. Create a source
    source = Source(
        id=1,
        name="Test HTML Source",
        url=source_url,
        scraper_type="HTML",
        config={"article_link_selector": ".article-link"}
    )
    db.add(source)
    db.commit()

    # 4. Run the scraper
    scrape_source(db, source)

    # 5. Assert that only one new article was created
    articles = db.query(Article).order_by(Article.id).all()
    assert len(articles) == 2  # The existing one + the new one
    assert articles[0].title == "Existing Article"
    assert articles[1].title == "Article 2 Title"
