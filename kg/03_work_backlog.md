# Work Backlog: Personalized News Aggregator

This document lists the remaining tasks required to complete the project. It is based on the original `TODO.md` file and tracks progress using a Test-Driven Development (TDD) approach.

## Task Status Key
*   `[ ]` - Not Started
*   `[-]` - In progress
*   `[x]` - Completed

## Issues

* [x] - In the main page, the default for the filters should be: All categories, Unread only, Minimum score: 75
* [x] - The "Unread only" filter does not work
* [x] - Filtering by category also doesn't work
* [x] - The list of categories in the drop box is not in alphabetical order
* [x] - The article card does not show categories
* [x] - The scraping progress indicator should show how many articles have been skipped (duplicates) or were not processed because of an error; right now the progress bar does not move at all if articles are being skipped or can't be fetched because of an error
* [ ] - Filtering by category: to be honest though, it would be more useful to me to be able to *exclude* some categories from the list (rather than just viewing the list for a specific category)
* [ ] - Clickbait titles. I hate clickbait titles. Perhaps we should replace titles with generated ones that are more accurate and not clickbaity.
* [ ] - Need a way to trigger reprocessing (summary, categories, score, etc.) an article, if the processing failed for some reason. (Eg. right now I have a couple articles with no summary and no score, and strangely one article with not even a title.)

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