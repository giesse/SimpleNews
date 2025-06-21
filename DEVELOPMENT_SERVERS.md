# Running Development Servers

This document outlines the steps to run the frontend and backend development servers for the Personalized News Aggregator project.

## Prerequisites

Before running the development servers, ensure you have the following:

*   **Docker**: Required for the VS Code Devcontainer setup.
*   **VS Code Dev Containers extension**: Installable from the VS Code marketplace.
*   **Node.js and npm/yarn/pnpm/bun**: For the frontend development. These are typically handled by the devcontainer setup.
*   **Python and pip**: For the backend development. These are also typically handled by the devcontainer setup.

The project is configured to run within a **VS Code Devcontainer**. If you haven't already, open the project folder in VS Code and you will be prompted to "Reopen in Container". The devcontainer automatically installs all backend (`pip`) and frontend (`npm`) dependencies upon creation.

## Backend Development Server

The backend is a FastAPI application.

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Install Python dependencies**:
    While the devcontainer should handle this automatically, if you are running outside the devcontainer or need to reinstall, use:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the FastAPI application using Uvicorn**:
    ```bash
    uvicorn app.main:app --reload
    ```
    This command starts the backend server, typically accessible at `http://127.0.0.1:8000` or `http://localhost:8000`. The `--reload` flag ensures the server restarts automatically on code changes.

## Frontend Development Server

The frontend is a Next.js application.

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install Node.js dependencies**:
    While the devcontainer should handle this automatically, if you are running outside the devcontainer or need to reinstall, use:
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    # or bun install
    ```
3.  **Run the Next.js development server**:
    ```bash
    npm run dev
    # or yarn dev
    # or pnpm dev
    # or bun dev
    ```
    This command starts the frontend development server, typically accessible at `http://localhost:3000`. The page will auto-update as you edit files.

## Testing Both Servers

Once both servers are running:

*   Open your web browser and navigate to `http://localhost:3000` to access the frontend application.
*   The frontend will make API calls to the backend, which by default will be running on `http://localhost:8000`.