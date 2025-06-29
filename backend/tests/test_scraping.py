from app.scraping import scrape_html, scrape_and_save_article
from app.models import Article


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


def test_scrape_and_save_duplicate_url(db):
    """
    Tests that the scraper correctly identifies and ignores a URL that is already in the database.
    """
    # 1. Create a mock article and save it to the database
    existing_article = Article(
        url="http://example.com/article1",
        title="Existing Article",
        original_content="This is an existing article.",
    )
    db.add(existing_article)
    db.commit()

    # 2. Attempt to scrape and save the same URL
    result = scrape_and_save_article(db, "http://example.com/article1")

    # 3. Assert that the function returns the correct message and doesn't add a new article
    assert result == {"message": "Article already exists"}
    assert db.query(Article).count() == 1


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
