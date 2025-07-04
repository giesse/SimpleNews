# Product Overview: Personalized News Aggregator

## Core Concept

The Personalized News Aggregator is a system designed to:
1.  Scan various websites for new articles.
2.  Summarize these articles using an LLM (Language Model).
3.  Display the summarized articles to users based on their defined interests.

The primary goal is to create a smart, self-hosted news feed that adapts to individual user preferences, providing relevant and concise information.

## Problem Solved

In an era of information overload, finding relevant news articles can be time-consuming. This aggregator aims to solve this by:
*   Automating the discovery of new content.
*   Using AI to distill long articles into digestible summaries.
*   Tailoring the news feed to specific user interests, filtering out noise.

## Target Users

*   Individuals who want a personalized news feed without relying on mainstream algorithms.
*   Users who prefer to self-host their applications for privacy and control.
*   Developers interested in a practical application of LLMs and web scraping technologies.

## Core Business Goals (Implicit)

While not a commercial product in its current description, the project aims to:
*   Deliver a functional and useful news aggregation service.
*   Provide a platform for learning and experimenting with AI and web technologies.
*   Ensure user satisfaction through relevant content and a clean interface.

## Key Features (Planned)

*   **Web Scraping:** Ability to fetch content from various news sources.
*   **LLM Summarization & Categorization:** Using Google Gemini API to process articles.
*   **Personalization:** Users can define an "interest prompt" to tailor their feed.
*   **User Interaction:** Liking/disliking articles to refine personalization.
*   **Database Storage:** Storing articles, user preferences, and sources.
*   **API Backend:** FastAPI server to manage data and business logic.
*   **Web Frontend:** Next.js application to display news and interact with users.

## Architecture Overview

The system comprises:
*   A **Frontend** (Next.js) for user interaction.
*   A **Backend** (FastAPI) handling API requests, business logic, and LLM interaction.
*   A **Scraping Service** to fetch articles.
*   A **Data Layer** (SQLite/PostgreSQL) for storage.
*   **External Services** including news websites and the Google Gemini API.

Detailed technology stack choices are documented in [ADR 001: Choice of Technology Stack](./decisions/001-technology-stack.md). The overall architecture is described in this document and further detailed by the various components within the knowledge graph.
