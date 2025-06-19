# Plan: LLM Integration with Google AI for Gemma

This plan outlines the specific steps required to integrate the Google AI platform, specifically using the Gemma model, into the backend of the News Aggregator application. The goal is to create a dedicated, reusable service that can process article content to generate summaries and categories.

## 1. Core Principles

*   **Modularity**: The LLM interaction logic will be encapsulated within its own module, `llm_interface.py`, to keep it decoupled from the main API server logic.
*   **Configuration-driven**: API keys and model names will be managed via environment variables, not hardcoded.
*   **Error Handling**: The interface will include basic error handling to gracefully manage API failures or unexpected responses.

## 2. Implementation Steps

The integration will be broken down into four main phases: Setup, Core Service Implementation, API Integration, and finally, updating the data processing pipeline.

### Phase 1: Environment Setup & Configuration

1.  **Create the LLM Interface File**: A new file will be created to house all the logic for interacting with the Gemini API.
    *   **File Path**: [`backend/app/llm_interface.py`](backend/app/llm_interface.py)

2.  **Update Dependencies**: The official Google AI Python SDK needs to be added to the project's backend dependencies.
    *   **File to Modify**: [`backend/requirements.txt`](backend/requirements.txt)
    *   **Line to Add**: `google-generativeai`

3.  **API Key Management**: The Gemini API key will be managed securely using an environment variable. The application will be configured to read this variable. We will add this to the FastAPI settings management for robust configuration.

### Phase 2: Core LLM Service Implementation (`llm_interface.py`)

This new module will contain the primary logic for communicating with the Google AI platform. It will be based on the example you provided.

```python
# Proposed content for backend/app/llm_interface.py

import os
import google.generativeai as genai
from google.generativeai import types
from typing import Tuple, List

# The API key is loaded automatically from the GEMINI_API_KEY environment variable.
# A single client instance can be reused.
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def generate_summary_and_categories(article_text: str) -> Tuple[str, List[str]]:
    """
    Sends article text to the Gemma model to generate a summary and categories.

    Args:
        article_text: The core text content of the news article.

    Returns:
        A tuple containing the summary (str) and a list of categories (List[str]).
    """
    model = "gemma-3-27b-it" # Using the specified Gemma model
    
    # We will design a robust prompt to get the output in a structured format.
    # This makes parsing the response reliable.
    prompt = f"""
    Analyze the following news article and provide a concise summary and a list of relevant categories.

    **Article Text:**
    ---
    {article_text}
    ---

    **Instructions:**
    1.  **Summary**: Write a neutral, one-paragraph summary of the article.
    2.  **Categories**: Provide a comma-separated list of 3-5 relevant categories (e.g., "Technology", "Artificial Intelligence", "Business").

    **Output Format (Strictly follow this):**
    Summary: [Your summary here]
    Categories: [Category 1, Category 2, Category 3]
    """

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        temperature=0.2, # Lower temperature for more predictable, factual output
    )

    try:
        # Gemma models are often used with streaming, so we'll aggregate the response.
        full_response = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            full_response += chunk.text

        # Simple and robust parsing of the structured response
        summary = full_response.split("Summary:")[1].split("Categories:")[0].strip()
        categories_str = full_response.split("Categories:")[1].strip()
        categories = [cat.strip() for cat in categories_str.split(',')]
        
        return summary, categories

    except Exception as e:
        print(f"An error occurred while calling the Google AI API: {e}")
        # Return empty values or raise a custom exception
        return "", []

```

### Phase 3: Integration with FastAPI Server

The core LLM service will be called from the main application, likely triggered by a new API endpoint responsible for processing articles.

1.  **Create a Processing Endpoint**: We'll add a new endpoint in [`backend/app/main.py`](backend/app/main.py). This endpoint will take an article ID, fetch its content, use the `llm_interface` to get the summary and categories, and save them to the database.

    ```python
    # Snippet to be added in backend/app/main.py

    from . import llm_interface, crud, schemas

    @app.post("/articles/{article_id}/process", status_code=200)
    def process_article(article_id: int, db: Session = Depends(get_db)):
        db_article = crud.get_article(db, article_id=article_id)
        if not db_article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Call the new LLM interface
        summary, categories = llm_interface.generate_summary_and_categories(
            article_text=db_article.original_content
        )

        if not summary:
            raise HTTPException(status_code=500, detail="Failed to process article with LLM")

        # Save the enriched data back to the database
        updated_article = crud.update_article_summary(db, article_id=article_id, summary=summary)
        crud.link_categories_to_article(db, article_id=article_id, categories=categories)
        
        return {"message": "Article processed successfully", "article_id": article_id}
    ```

2.  **Update Database Logic (`crud.py`)**: The `crud.py` file will need new functions to handle updating an article with its summary and linking it to categories.

### Phase 4: Visualization of the New Component

The following diagram illustrates how the new `LLM Interface` fits into the existing backend architecture.

```mermaid
graph TD
    subgraph Backend
        B[FastAPI API Server]
        D[LLM Interface]
        C[Scraping Service]
    end

    subgraph External Services
        G[Google AI API (Gemma)]
    end
    
    subgraph Data Layer
        E[Database]
    end

    C -- Triggers processing via --> B
    B -- Calls function --> D
    D -- Sends API Request --> G
    G -- Returns summary/categories --> D
    D -- Returns parsed data --> B
    B -- Updates --> E
```