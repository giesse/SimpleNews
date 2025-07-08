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
*   **Product Overview:** [`01_product_overview.md`](./01_product_overview.md) - Core concept, problems solved, target users, features, and architecture of the news aggregator.
*   **Glossary:** [`02_glossary.md`](./02_glossary.md) - Definitions of key terms and acronyms used throughout the project.
*   **Work Backlog:** [`03_work_backlog.md`](./03_work_backlog.md) - Current tasks, bugs, and features in progress or planned for development.

**Architectural Decisions:**
*   [`001-technology-stack.md`](./decisions/001-technology-stack.md) - Documents and justifies the project's technology choices including FastAPI, Next.js, and Google Gemini API.

**Reusable Patterns:**
*   [`test-driven-development.md`](./patterns/test-driven-development.md) - Explains the TDD methodology used in this project with examples of implementation.
*   [`tailwind-css-v4-configuration.md`](./patterns/tailwind-css-v4-configuration.md) - Details the correct configuration and usage of Tailwind CSS v4 in the Next.js frontend.

**How-To Guides:**
*   [`setup_local_environment.md`](./how-to/setup_local_environment.md) - Step-by-step instructions for setting up the development environment using VS Code Devcontainers.
*   [`run_development_servers.md`](./how-to/run_development_servers.md) - Guide for running the frontend and backend development servers.
*   [`initialize-knowledge-graph.md`](./how-to/initialize-knowledge-graph.md) - Instructions for adding new content to the knowledge graph.

**Data Models:**
*   [`database_schema.md`](./data_models/database_schema.md) - Complete database schema with tables for users, articles, sources, categories, and their relationships.

## Navigating the Knowledge Graph

Use the links above to explore different sections. Each section is designed to be self-contained but may link to other relevant documents.

This knowledge graph is a living document and should be updated as the project evolves.