# Work Backlog: Personalized News Aggregator

This document lists the remaining tasks required to complete the project. It is based on the original `TODO.md` file and tracks progress using a Test-Driven Development (TDD) approach.

## Task Status Key
*   `[x]` - Completed
*   `[ ]` - Not Started
*   `[-]` - In Progress (if applicable, though original uses only complete/incomplete)

## Issues

NOTE: Many of the issues below about the UI being ugly were mostly due to Tailwind CSS not being configured properly. That is now fixed so take those issues with a grain of salt.

* [x] - the python backend does not seem to read the .env file in the backend directory; or it's not getting the gemini api key from it correctly. Can we write a test for this?
* [x] - This is a single user app, editing sources should be linked from the main page, not hidden inside /admin/sources; Perhaps it should even be a dialog?
* [ ] - Navigation between main page and editing sources is bad. No link back. I still think perhaps editing sources should be a dialog rather than a separate page.
* [ ] - The scraping process can take a long time and currently the HTTP post has to wait for it; we may want this to be async and we may want the UI to have some kind of feedback about progress
* [ ] - There are a lot of errors while trying to download articles; we may want to pretend to be Firefox (or Google, in fact that might be much better) to be able to access most of the sources.
* [ ] - I want, as the highest priority, to be able to scrape a source and get articles from it, and have them summarized and categorized appropriately, and browsable from the main page. "Path to success". Let's follow TDD whenever possible.
* [ ] - the UI is really ugly right now. I don't need it to be particularly beautiful but it would be nice if it wasn't so ugly.
* [ ] - Articles are not being summarized or categorized after being scraped
* [ ] - The display of articles only shows the title right now (probably because summary and categories are missing); notably though there is no link to the actual article for me to go read it!
* [ ] - I need to be able to filter the list of article by category (mostly I care about hiding certain categories), as well as marking articles read (which should be hidden by default)
* [ ] - The goal is, by default, to only see things that I care about and don't see things I don't care about. Perhaps the categorization will be enough for this, but I'm thinking that maybe we should have a separate call to the LLM to evaluate a score for how much I will care about the article. The prompt for this will have to be refined over time. (It would be nice to have this prompt refined automatically, but, I'm ok with a simpler solution to start with.)
* [x] - Tailwind CSS v4 configuration issues in the frontend. Resolved by updating PostCSS config format and CSS import syntax. See [Tailwind CSS v4 Configuration](./patterns/tailwind-css-v4-configuration.md) documentation.

## High Priority (Completed)

*   **Frontend: Initialize Project**
    *   `[x]` Remove the placeholder `package.json`.
    *   `[x]` Initialize a new Next.js application with TypeScript: `npx create-next-app@latest . --ts --eslint --app --src-dir --import-alias "@/*"`
    *   `[x]` Clean up default boilerplate code from the Next.js installation.
    *   `[x]` Set up Jest and React Testing Library for frontend testing.

*   **Backend: Scraping Service**
    *   `[x]` **Test:** Write a failing test in a new `backend/tests/test_scraping.py` file to verify that a function can scrape content from a mock HTML page.
    *   `[x]` **Implement:** Create the `backend/app/scraping.py` module and the scraping function to pass the test.
    *   `[x]` **Test:** Write a failing test to ensure the scraper correctly identifies and ignores a URL that is already in the database.
    *   `[x]` **Implement:** Add the duplicate-checking logic to the scraping service.
    *   `[x]` **Test:** Write a failing test in a new `backend/tests/test_scraping.py` to verify that `trafilatura` extracts the main content from a sample HTML page.
    *   `[x]` **Implement:** Create the `backend/app/scraping.py` module and implement the content extraction logic.

*   **Backend: LLM Integration**
    *   `[x]` **Test:** Write a failing test for the main summarization endpoint in `backend/tests/test_main.py`, mocking the LLM API call.
    *   `[x]` **Implement:** Create the API endpoint that triggers the summarization and categorization for an article.

## Medium Priority

*   **Frontend: UI Development**
    *   `[x]` **Test:** Write a failing test for a component that displays a list of article summaries.
    *   `[x]` **Implement:** Create the main page and the article list component.
    *   `[ ]` **Test:** Write a failing test for user interaction, such as a "like" button click.
    *   `[ ]` **Implement:** Add the UI elements and connect them to API calls.

*   **Backend: API Endpoints**
    *   `[x]` **Test:** Write a failing test in `test_main.py` for CRUD operations on `ARTICLES`.
    *   `[x]` **Implement:** Create the API endpoints for managing `ARTICLES`.
    *   `[x]` **Test:** Write a failing test in `test_main.py` for CRUD operations on `SOURCES`.
    *   `[x]` **Implement:** Create the API endpoints for managing `SOURCES`.
    *   `[ ]` **Test:** Write a failing test for creating `USER_ARTICLE_INTERACTIONS`.
    *   `[ ]` **Implement:** Create the API endpoint for user interactions.

*   **Frontend: User Personalization**
    *   `[ ]` **Test:** Write a failing test for a settings page component that allows users to edit their "interest" prompt.
    *   `[ ]` **Implement:** Create the settings page.
    *   `[ ]` **Test:** Write a failing test to verify that liking/disliking an article updates the user's interest data model.
    *   `[ ]` **Implement:** Implement the logic to automatically update user preferences.

## Future Considerations / Low Priority
(No items listed in the original `TODO.md` under this category)

This backlog should be reviewed and updated regularly as the project progresses. New tasks, bugs, or ideas for improvement should be added here.
