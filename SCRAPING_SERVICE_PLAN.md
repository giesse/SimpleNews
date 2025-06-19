## Plan: Backend Scraping Service

### 1. Overview

The goal is to build a robust and extensible scraping service that can fetch articles from various online sources, process them, and store them in our database. The development will strictly follow a Test-Driven Development (TDD) methodology, ensuring each component is tested before and after implementation.

The service must be designed to handle different types of sources:
*   **HTML Sites**: Traditional news websites or blogs where the scraper needs to parse HTML to find and extract article links and content.
*   **API/JSON-based Sites**: Modern sites (like Reddit) that provide content via a structured JSON API.

### 2. High-Level Design

The scraping process will be orchestrated by a central function that takes a `Source` object as input. This function will delegate the actual scraping logic to a specific "strategy" based on the source's type. This approach keeps the design modular and easy to extend with new scraping strategies in the future.

Here is a diagram illustrating the workflow:

```mermaid
graph TD
    A[Start Scraping Process] --> B{Get Source from DB};
    B --> C{Select Strategy based on Source Type};
    C --> D1[HTML Parsing Strategy];
    C --> D2[JSON API Strategy];
    C --> D3[... other strategies];

    subgraph HTML Parsing Strategy
        D1 --> E1[Fetch Source URL (e.g., homepage)];
        E1 --> F1[Extract Article Links];
    end

    subgraph JSON API Strategy
        D2 --> F2[Fetch API Endpoint];
    end

    F1 --> G{For Each Article URL/Item};
    F2 --> G;

    G --> H{URL in DB?};
    H -- Yes --> I[Skip];
    H -- No --> J[Fetch Full Article Content];
    J --> K[Extract Title & Main Text];
    K --> L[Create Article in DB];
    L --> M[End];
    I --> M;
```

### 3. Core Components & Logic

#### a. Scraping Module (`backend/app/scraping.py`)
This new module will contain all the scraping-related logic. The primary function will be:

`def scrape_source(db: Session, source: models.Source):`
*   This function will initiate the scraping process for a given source.
*   Initially, it will contain the logic for handling a simple, mock HTML page.
*   It will be extended to select different scraping strategies.

#### b. Duplicate URL Checking
This is a critical feature to avoid redundant data processing and storage.
*   The existing `crud.get_article_by_url(db, url)` function is perfectly suited for this.
*   **Logic**: Before processing any discovered article URL, the scraper will call this function. If it returns an `Article` object, the URL is a duplicate, and the scraper will skip it.

### 4. TDD Implementation Steps

We will implement the service in two main phases, following the TDD tasks outlined in `TODO.md`.

#### Phase 1: Basic HTML Scraping

1.  **Write Failing Test for HTML Scraping:**
    *   Create a new test file: [`backend/tests/test_scraping.py`](backend/tests/test_scraping.py).
    *   Define a test case `test_scrape_mock_html_page`.
    *   This test will:
        1.  Create a mock HTML file on the fly (e.g., `mock_page.html`) with a simple article structure.
        2.  Call a new `scrape_mock_page()` function (or similar) in the `scraping` module.
        3.  Assert that one new article has been added to the database with the correct title and content from the mock file.
    *   This test will fail because the scraping module and function do not exist yet.

2.  **Implement Basic Scraper to Pass Test:**
    *   Create the file: [`backend/app/scraping.py`](backend/app/scraping.py).
    *   Implement the scraping function.
    *   Use a library like `BeautifulSoup` (which we'll add to `requirements.txt`) to parse the mock HTML file.
    *   Extract the title and content, and use `crud.create_article` to save it to the database.
    *   Run the test again to confirm it passes.

#### Phase 2: Duplicate URL Checking

1.  **Write Failing Test for Duplicate URL:**
    *   In [`backend/tests/test_scraping.py`](backend/tests/test_scraping.py), add a new test case `test_scraper_ignores_duplicate_url`.
    *   This test will:
        1.  Manually create an `Article` in the test database with a specific URL (e.g., `http://example.com/article1`).
        2.  Run the scraper on a mock page that contains a link to that same URL.
        3.  Assert that the total number of articles in the database has *not* changed.
    *   This test will fail because the current implementation doesn't check for duplicates.

2.  **Implement Duplicate Checking Logic:**
    *   Modify the scraping function in [`backend/app/scraping.py`](backend/app/scraping.py).
    *   Before creating a new article, use `crud.get_article_by_url()` to check if the article's URL already exists in the database.
    *   Wrap this logic in an `if` condition: only call `crud.create_article()` if the URL is not found.
    *   Run the test again to confirm it passes.

### 5. Future-Proofing and Extensibility

To handle real-world sites, we should enhance the `Source` model and the scraper's logic.

*   **Enhance `Source` Model**: I recommend adding a `scraper_type` column to the [`models.Source`](backend/app/models.py:33) table (e.g., with values like `'HTML'`, `'JSON'`). This will allow the main scraping function to easily select the correct strategy.
*   **HTML Strategy**: This will use `requests` to fetch the page and `BeautifulSoup` to find all `<a>` tags pointing to articles. For each link, it will perform the duplicate check and then proceed to scrape the content.
*   **Content Extraction**: For extracting the main body of text from a cluttered HTML article page, we should use a specialized library like `trafilatura`, as mentioned in the `TODO.md` for the LLM integration. This will be part of the "Fetch Full Article Content" step.
*   **JSON Strategy**: This will simply use `requests` to fetch the data from the source's URL, parse the JSON, and iterate through the items, performing the duplicate check for each one.