# How to Initialize the Knowledge Graph

This guide explains how to set up a Markdown-based knowledge graph for a new project. This approach is based on the principle of "documentation-as-code," keeping project knowledge version-controlled and accessible.

## Rationale

Using a Markdown-based knowledge graph offers several advantages:
*   **Simplicity:** Markdown is easy to read and write for all developers.
*   **Version Control:** Storing documentation in Git versions it alongside the code.
*   **Accessibility:** It's readable by both humans and AI assistants.
*   **Extensibility:** The text-based format allows for future scripting and automation.

## Directory Structure

Create a `kg/` directory at the root of your project. The recommended structure is as follows:

```
kg/
├── root.md                 <-- The main entry point for the AI
├── 01_product_overview.md
├── 02_glossary.md
├── 03_work_backlog.md
|
├── patterns/
│   ├── pattern-example.md
|
├── decisions/
│   ├── 001-example-decision.md
|
├── how-to/
│   ├── setup_local_environment.md
|
└── data_models/
    ├── example_model.md
```

## Core Components

1.  **`root.md`:** The most critical file. It acts as an instruction manual for the AI, explaining how to use the knowledge base and linking to key entry points.

2.  **`01_product_overview.md`:** A high-level summary of the project. What problem does it solve? Who are the users? What are the core business goals?

3.  **`02_glossary.md`:** A central place to define project-specific terms to ensure consistency.

4.  **`03_work_backlog.md`:** A lightweight, in-repository backlog for tracking tasks, technical debt, and ideas.

5.  **`patterns/`:** A directory for documenting reusable architectural or coding patterns. Each pattern should be in its own file (e.g., `authentication.md`, `error_handling.md`).

6.  **`decisions/`:** A log of important architectural decisions, using the Architecture Decision Record (ADR) format. Each decision gets its own numbered file (e.g., `001-use-postgresql.md`). An ADR should include:
    *   **Status:** Proposed, Accepted, Deprecated
    *   **Context:** The problem being addressed.
    *   **Decision:** The chosen solution.
    *   **Consequences:** The trade-offs of the decision.

7.  **`how-to/`:** Step-by-step guides for common developer tasks (e.g., `setup_local_environment.md`, `deploy_to_staging.md`).

8.  **`data_models/`:** (Optional) Descriptions of your primary data structures.

## Initialization Steps

1.  Create the `kg/` directory in your project's Git repository.
2.  Create the `root.md` file and populate it with instructions and links to the other key files.
3.  Create the subdirectories: `patterns/`, `decisions/`, `how-to/`, and `data_models/` (if needed).
4.  Populate the knowledge graph, starting with the `01_product_overview.md` and any critical patterns or decisions.
5.  Instruct your AI assistant to use this knowledge base by pointing it to `kg/root.md`.