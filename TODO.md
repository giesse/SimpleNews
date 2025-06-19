# Project TODO List: Personalized News Aggregator (TDD Approach)

This document lists the remaining tasks required to complete the project. Each feature will be developed following a Test-Driven Development (TDD) workflow: write a failing test, then write the code to make it pass.

## High Priority

-   [x] **Frontend: Initialize Project**
    -   [x] Remove the placeholder `package.json`.
    -   [x] Initialize a new Next.js application with TypeScript: `npx create-next-app@latest . --ts --eslint --app --src-dir --import-alias "@/*"`
    -   [x] Clean up default boilerplate code from the Next.js installation.
    -   [x] Set up Jest and React Testing Library for frontend testing.

-   [ ] **Backend: Scraping Service**
    -   [x] **Test:** Write a failing test in a new `backend/tests/test_scraping.py` file to verify that a function can scrape content from a mock HTML page.
    -   [x] **Implement:** Create the `backend/app/scraping.py` module and the scraping function to pass the test.
    -   [x] **Test:** Write a failing test to ensure the scraper correctly identifies and ignores a URL that is already in the database.
    -   [x] **Implement:** Add the duplicate-checking logic to the scraping service.
    -   [x] **Test:** Write a failing test in a new `backend/tests/test_scraping.py` to verify that `trafilatura` extracts the main content from a sample HTML page.
    -   [x] **Implement:** Create the `backend/app/scraping.py` module and implement the content extraction logic.

-   [ ] **Backend: LLM Integration**
    -   [x] **Test:** Write a failing test for the main summarization endpoint in `backend/tests/test_main.py`, mocking the LLM API call.
    -   [x] **Implement:** Create the API endpoint that triggers the summarization and categorization for an article.

## Medium Priority

-   [ ] **Frontend: UI Development**
    -   [ ] **Test:** Write a failing test for a component that displays a list of article summaries.
    -   [ ] **Implement:** Create the main page and the article list component.
    -   [ ] **Test:** Write a failing test for user interaction, such as a "like" button click.
    -   [ ] **Implement:** Add the UI elements and connect them to API calls.

-   [ ] **Backend: API Endpoints**
    -   [ ] **Test:** Write a failing test in `test_main.py` for CRUD operations on `ARTICLES`.
    -   [x] **Implement:** Create the API endpoints for managing `ARTICLES`.
    -   [x] **Test:** Write a failing test in `test_main.py` for CRUD operations on `SOURCES`.
    -   [x] **Implement:** Create the API endpoints for managing `SOURCES`.
    -   [ ] **Test:** Write a failing test for creating `USER_ARTICLE_INTERACTIONS`.
    -   [ ] **Implement:** Create the API endpoint for user interactions.

-   [ ] **Frontend: User Personalization**
    -   [ ] **Test:** Write a failing test for a settings page component that allows users to edit their "interest" prompt.
    -   [ ] **Implement:** Create the settings page.
    -   [ ] **Test:** Write a failing test to verify that liking/disliking an article updates the user's interest data model.
    -   [ ] **Implement:** Implement the logic to automatically update user preferences.