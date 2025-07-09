# Work Backlog: Personalized News Aggregator

This document lists the remaining tasks required to complete the project. It is based on the original `TODO.md` file and tracks progress using a Test-Driven Development (TDD) approach.

## Task Status Key
*   `[ ]` - Not Started
*   `[-]` - In Progress (if applicable, though original uses only complete/incomplete)

## Path to success

My highest priority is to be able to scrape a source and get articles from it, and have them summarized and categorized appropriately, and browsable from the main page.

* [x] - There are a lot of errors while trying to download articles; we may want to pretend to be Firefox (or Google, in fact that might be much better) to be able to access most of the sources.
* [x] - Articles are not being summarized or categorized after being scraped
* [x] - The goal is, by default, to only see things that I care about and don't see things I don't care about. Perhaps the categorization will be enough for this, but I'm thinking that maybe we should have a separate call to the LLM to evaluate a score for how much I will care about the article. The prompt for this will have to be refined over time. (It would be nice to have this prompt refined automatically, but, I'm ok with a simpler solution to start with.)

## Issues

* [-] - The scraping process can take a long time and currently the HTTP post has to wait for it; we may want this to be async and we may want the UI to have some kind of feedback about progress
    - This is partially done but it looks like clicking an individual Scrape button for a source does not use the progress indicator.
    - I really would like a progress bar or some other sort of indication of what's going on; this does not appear to be working right now?
* [ ] - Remove outdated user table; this is a single user application. We will probably need a place to store settings though.
* [ ] - Clickbait titles. I hate clickbait titles. Perhaps we should replace titles with generated ones that are more accurate and not clickbaity.

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