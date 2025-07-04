# How To: Run Development Servers

This document outlines the steps to run the frontend and backend development servers for the Personalized News Aggregator project. These instructions assume you have already set up your local development environment as described in `setup_local_environment.md`.

All commands should be run from within the VS Code terminal, which is connected to the devcontainer.

## Backend Development Server (FastAPI)

The backend is a FastAPI application.

1.  **Navigate to the Backend Directory:**
    Open a new terminal in VS Code (if one isn't already open). By default, it should open in the `/workspace` directory, which is the root of the project.
    ```bash
    cd backend
    ```

2.  **Ensure Dependencies are Installed (Handled by Devcontainer):**
    Python dependencies (from `requirements.txt`) should have been automatically installed when the devcontainer was created or rebuilt. If you suspect issues or have manually changed `requirements.txt`, you can run:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the FastAPI Application:**
    Use Uvicorn to run the development server:
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```
    *   `app.main:app`: Points Uvicorn to the FastAPI application instance (`app`) in the `main.py` file within the `app` directory.
    *   `--reload`: Enables auto-reloading, so the server restarts automatically when code changes are detected.
    *   `--host 0.0.0.0`: Makes the server accessible from outside the container (necessary for the frontend to connect).
    *   `--port 8000`: Specifies the port on which the server will listen. This port is forwarded by the devcontainer configuration.

    The backend server will typically be accessible at `http://localhost:8000` on your local machine.

## Frontend Development Server (Next.js)

The frontend is a Next.js application.

1.  **Navigate to the Frontend Directory:**
    Open a new terminal in VS Code or use an existing one.
    ```bash
    cd frontend
    ```

2.  **Ensure Dependencies are Installed (Handled by Devcontainer):**
    Node.js dependencies (from `package.json`) should have been automatically installed by the `npm install` command during the devcontainer's `postCreateCommand`. If you've changed `package.json` or suspect issues, run:
    ```bash
    npm install
    ```

3.  **Run the Next.js Development Server:**
    ```bash
    npm run dev
    ```
    This command starts the Next.js development server.

    The frontend server will typically be accessible at `http://localhost:3000` on your local machine. The page will auto-update as you edit files.

## Testing Both Servers

Once both servers are running:

1.  **Access Frontend:** Open your web browser and navigate to `http://localhost:3000`. You should see the Next.js application.
2.  **API Interaction:** The frontend application is configured to make API calls to the backend server at `http://localhost:8000`. Any interactions on the frontend that require backend data should now work.

## Notes

*   **Multiple Terminals:** It's common to have at least two terminals open in VS Code: one for the backend server and one for the frontend server.
*   **Port Conflicts:** If ports `3000` or `8000` are already in use on your local machine (outside the container), you might encounter issues. The devcontainer forwards these ports, so the conflict would be with other applications running locally.
*   **Log Output:** Both servers will output logs to their respective terminals. Check these logs for any errors or important messages.
