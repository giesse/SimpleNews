# Work Backlog: Personalized News Aggregator

This document lists the remaining tasks required to complete the project. It is based on the original `TODO.md` file and tracks progress using a Test-Driven Development (TDD) approach.

## Task Status Key
*   `[ ]` - Not Started
*   `[-]` - In progress
*   `[x]` - Completed

## Path to success

My highest priority is to be able to scrape a source and get articles from it, and have them summarized and categorized appropriately, and browsable from the main page.

* [x] - There are a lot of errors while trying to download articles; we may want to pretend to be Firefox (or Google, in fact that might be much better) to be able to access most of the sources.
* [x] - Articles are not being summarized or categorized after being scraped
* [x] - The goal is, by default, to only see things that I care about and don't see things I don't care about. Perhaps the categorization will be enough for this, but I'm thinking that maybe we should have a separate call to the LLM to evaluate a score for how much I will care about the article. The prompt for this will have to be refined over time. (It would be nice to have this prompt refined automatically, but, I'm ok with a simpler solution to start with.)

## Issues

* [x] - Marking an article read throws an error
* [x] - Categories are not working? (Not appearing in the UI, can't filter by category etc. - they seem to be in the DB though)
* [x] - We may want to overhaul job handling (see next issue). The UI should be able to cancel a job at least.
* [x] - The scraping process can take a long time and currently the HTTP post has to wait for it; we may want this to be async and we may want the UI to have some kind of feedback about progress
    - This is partially done but it looks like clicking an individual Scrape button for a source does not use the progress indicator.
    - I really would like a progress bar or some other sort of indication of what's going on; this does not appear to be working right now?
    - This has gotten really bad! Scraping and processing articles takes half an hour or more and the UI is completely blocked in the meantime?
* [ ] - The scraping progress indicator should show how many articles have been skipped (duplicates) or were not processed because of an error
* [x] - Remove outdated user table; this is a single user application. We will probably need a place to store settings though.
* [ ] - Clickbait titles. I hate clickbait titles. Perhaps we should replace titles with generated ones that are more accurate and not clickbaity.

## Technical Debt & Test Improvements

*   `[x]` **Fix Frontend Tests:** The frontend tests were failing due to timing issues and incorrect mocks. They have been refactored to be more robust and are now passing.
*   `[ ]` **Improve Background Job Tests:** The test for bulk article scoring (`test_bulk_article_scoring`) is inadequate. It should be updated to test the full lifecycle of the job (status polling, completion) to match the standard set by the scraping job test.
*   `[ ]` **Add HTTP API Integration Tests:** The `test_scraping.py` file contains only pure unit tests. While valuable, they don't test the HTTP API layer. We should add integration tests that use the `client` to test the scraping endpoints directly, ensuring the full stack works as expected.

## Things to think about later

*   **Frontend: UI Development**
    *   `[ ]` **Test:** Write a failing test for user interaction, such as a "like" button click.
    *   `[ ]` **Implement:** Add the UI elements and connect them to API calls.

*   **Backend: API Endpoints**
    *   `[ ]` **Test:** Write a failing test for creating `USER_ARTICLE_INTERACTIONS`.
    *   `[ ]` **Implement:** Create the API endpoint for user interactions.

*   **Frontend: User Personalization**
    *   `[x]` **Test:** Write a failing test for a settings page component that allows users to edit their "interest" prompt.
    *   `[x]` **Implement:** Create the settings page.
    *   `[ ]` **Test:** Write a failing test to verify that liking/disliking an article updates the user's interest data model.
    *   `[ ]` **Implement:** Implement the logic to automatically update user preferences.

## Future Considerations / Low Priority
(No items listed in the original `TODO.md` under this category)

This backlog should be reviewed and updated regularly as the project progresses. New tasks, bugs, or ideas for improvement should be added here.