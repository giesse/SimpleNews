# How To: Set Up Local Development Environment

This guide explains how to set up the local development environment for the Personalized News Aggregator project. The project is configured to run in a VS Code Devcontainer, which simplifies setup and ensures consistency across developer machines.

## Prerequisites

1.  **Docker:** You must have Docker Desktop (or Docker Engine) installed and running on your system. Docker is used to create and manage the development container.
2.  **Visual Studio Code (VS Code):** The recommended code editor for this project.
3.  **VS Code Dev Containers Extension:** Install the "Dev Containers" extension (identifier: `ms-vscode-remote.remote-containers`) from the VS Code Marketplace. This extension allows VS Code to work with devcontainers.

## Setup Steps

1.  **Clone the Repository:**
    If you haven't already, clone the project repository to your local machine.
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Open Project in VS Code:**
    Open the cloned project folder in Visual Studio Code.

3.  **Reopen in Container:**
    Once the project is open, VS Code should detect the `.devcontainer/devcontainer.json` configuration file and show a notification at the bottom-right corner asking if you want to "Reopen in Container".
    *   Click on **"Reopen in Container"**.

4.  **Devcontainer Build:**
    *   VS Code will now build the Docker image for the devcontainer (if it's the first time or if the Docker configuration has changed). This process might take a few minutes as it downloads the base image and sets up the environment.
    *   The devcontainer is configured to automatically install backend Python dependencies (from `requirements.txt`) and frontend Node.js dependencies (from `package.json`) during its post-create phase. You can monitor this process in the VS Code terminal.

5.  **Environment Ready:**
    Once the build and post-create commands are complete, your development environment is ready. The VS Code window will be connected to the devcontainer, and you'll have access to a terminal within this isolated environment. All project files are mounted into the container, so changes you make locally are reflected inside, and vice-versa.

## What the Devcontainer Provides

*   **Python:** The correct version of Python as specified in the Dockerfile.
*   **Node.js & npm:** The correct version of Node.js and npm, managed via nvm.
*   **Pre-installed Dependencies:** Python packages (`pip install -r requirements.txt`) and Node.js packages (`npm install`) are installed automatically.
*   **VS Code Extensions:** Recommended extensions for Python, Prettier, ESLint, etc., are pre-installed within the devcontainer's VS Code instance.
*   **Port Forwarding:** Ports `3000` (for frontend) and `8000` (for backend) are automatically forwarded from the container to your local machine.

## Troubleshooting

*   **Docker Not Running:** Ensure Docker Desktop is running before trying to reopen in the container.
*   **Build Issues:** Check the logs in the VS Code terminal for any errors during the Docker image build or `postCreateCommand` execution.
*   **Extension Conflicts:** If you have many local VS Code extensions, some might conflict. The devcontainer provides a clean slate of extensions defined in `devcontainer.json`.

With these steps, you should have a fully functional local development environment. Refer to [`run_development_servers.md`](./run_development_servers.md) for instructions on how to run the frontend and backend servers.
