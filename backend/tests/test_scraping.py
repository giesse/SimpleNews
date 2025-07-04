from sqlalchemy.orm import Session

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
        "text": "Main Heading\nThis is the main content."
    }

    scraped_content = scrape_html(mock_html)

    assert scraped_content == expected_content


def test_scrape_source(db: Session):
    """
    Tests that scraping a source creates a dummy article.
    """
    # 1. Create a mock source and save it to the database
    source = Source(name="Test Source", url="http://test.com")
    db.add(source)
    db.commit()
    db.refresh(source)

    # 2. Call scrape_source
    result = scrape_source(db, source)

    # 3. Assert that a new article was created
    assert result == {"message": f"Scraped {source.name} and created a dummy article."}
    assert db.query(Article).count() == 1
    article = db.query(Article).first()
    assert article.source_id == source.id
    assert article.title == f"Dummy Article from {source.name}"


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

    expected_text = (
        "This is the header/boilerplate.\n"
        "Main Article\n"
        "This is the main content of the article."
    )

    # This will be the call to the new/modified scraping function
    scraped_content = scrape_html(mock_html)

    assert scraped_content["text"] == expected_text
