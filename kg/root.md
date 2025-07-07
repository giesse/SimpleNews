# Knowledge Graph Root

This directory (`kg/`) contains the project's knowledge graph. It is a collection of Markdown files designed to provide a comprehensive understanding of the project, its architecture, decisions, and processes.

The purpose of this knowledge graph is to:
*   Serve as a single source of truth for project information.
*   Onboard new developers quickly.
*   Provide context for AI assistants working with the codebase.
*   Document key architectural decisions and patterns.

## Project Summary

The project is a **Personalized News Aggregator** that scans websites, summarizes new articles using a local LLM (Gemma), and displays them based on user interests. The goal is to create a smart, self-hosted news feed that adapts to your preferences.

Important: Always use a TDD approach! Tests first!

**Key Technologies:**
*   **Backend:** Python with FastAPI
*   **Frontend:** TypeScript with Next.js (React)
*   **Database:** SQLite (development), PostgreSQL (production)
*   **Web Scraping:** `requests` & `BeautifulSoup`
*   **LLM Interface:** Google Gemini API

## How to Use This Knowledge Graph

*   **Start Here:** This `root.md` file is the main entry point.
*   **Product Overview:** For a high-level understanding of the project, see [`01_product_overview.md`](./01_product_overview.md).
*   **Glossary:** To understand project-specific terminology, refer to [`02_glossary.md`](./02_glossary.md).
*   **Work Backlog:** For current tasks and technical debt, see [`03_work_backlog.md`](./03_work_backlog.md).
*   **Architectural Decisions:** Important decisions are logged in the [`decisions/`](./decisions/) directory.
*   **Reusable Patterns:** Common patterns and best practices are documented in [`patterns/`](./patterns/).
*   **How-To Guides:** Step-by-step instructions for common tasks are available in [`how-to/`](./how-to/).
*   **Data Models:** Descriptions of data structures can be found in [`data_models/`](./data_models/).

## Navigating the Knowledge Graph

Use the links above to explore different sections. Each section is designed to be self-contained but may link to other relevant documents.

This knowledge graph is a living document and should be updated as the project evolves.