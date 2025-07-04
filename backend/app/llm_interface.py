import os
from google import genai
from google.genai import types
from typing import Tuple, List

# The API key is loaded automatically from the GEMINI_API_KEY environment variable.
# A single client instance can be reused.
client = None


def get_llm_client():
    """
    Initializes and returns the Gemini client.
    """
    global client
    if client is None:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    return client


def generate_summary_and_categories(article_text: str) -> Tuple[str, List[str]]:
    """
    Sends article text to the Gemini API to generate a summary and categories.

    Args:
        article_text: The core text content of the news article.

    Returns:
        A tuple containing the summary (str) and a list of categories (List[str]).
    """
    model = "gemma-3-27b-it"  # Using the specified Gemma model

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
    2.  **Categories**: Provide a comma-separated list of 3-5 relevant categories
        (e.g., "Technology", "Artificial Intelligence", "Business").

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

    # In the project plan, response_mime_type was "text/plain".
    # For structured output, we might consider "application/json" in the future,
    # but for now, parsing a structured text response is robust enough.
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        temperature=0.2,  # Lower temperature for more predictable, factual output
    )

    try:
        # Gemma models are often used with streaming, so we'll aggregate the response.
        full_response = ""
        llm_client = get_llm_client()
        for chunk in llm_client.models.generate_content_stream(
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
        print(f"An error occurred while calling the Gemini API: {e}")
        # Return empty values or raise a custom exception
        return "", []
