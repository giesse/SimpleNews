# Use a base image with Python and Node.js pre-installed
FROM mcr.microsoft.com/devcontainers/python:1-3.11-bullseye

USER root
# Create and own the workspace directory
RUN mkdir -p /workspace && chown -R vscode:vscode /workspace

# Install Node.js and npm
USER vscode
RUN bash -c "source /usr/local/share/nvm/nvm.sh && nvm install --lts && nvm alias default lts/*"

WORKDIR /workspace

# Install project dependencies
COPY --chown=vscode:vscode backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend package files
COPY --chown=vscode:vscode package.json package-lock.json* ./
RUN npm install