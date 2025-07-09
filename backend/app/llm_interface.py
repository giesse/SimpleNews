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
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY environment variable not set. "
                "Please ensure your .env file is correctly configured and loaded."
            )
        client = genai.Client(api_key=api_key)
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
            if chunk.text:
                full_response += chunk.text

        # Simple and robust parsing of the structured response
        summary = full_response.split("Summary:")[1].split("Categories:")[0].strip()
        categories_str = full_response.split("Categories:")[1].strip()
        categories = [cat.strip() for cat in categories_str.split(",")]

        return summary, categories

    except Exception as e:
        print(f"An error occurred while calling the Gemini API: {e}")
        # Return empty values or raise a custom exception
        return "", []

def generate_interest_score(article_text: str, user_interest_prompt: str) -> int:
    """
    Sends article text and user interest prompt to the Gemini API to generate an interest score.

    Args:
        article_text: The core text content of the news article.
        user_interest_prompt: A prompt describing the user's interests.

    Returns:
        An integer score between 0 and 100, representing how relevant the article is to the user.
    """
    model = "gemma-3-27b-it"  # Using the specified Gemma model

    prompt = f"""
    Given the following user interest prompt and article text, rate how relevant the article is to the user's interests on a scale of 0 to 100.

    **User Interest Prompt:**
    ---
    {user_interest_prompt}
    ---

    **Article Text:**
    ---
    {article_text}
    ---

    **Instructions:**
    1.  Provide a score from 0 to 100, where 0 means completely irrelevant and 100 means highly relevant.
    2.  Provide only the integer score as the output.

    **Output Format (Strictly follow this):**
    [Score]
    """

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        temperature=0.1,  # Low temperature for precise, numerical output
    )

    try:
        llm_client = get_llm_client()
        response = llm_client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )
        score = int(response.text.strip())
        return score
    except Exception as e:
        print(f"An error occurred while calling the Gemini API for interest scoring: {e}")
        return 0 # Return 0 on error or if score cannot be parsed


def find_article_link_selector(page_content: str) -> str:
    """
    Analyzes the HTML content of a source's main page to find the CSS selector
    that targets the primary article links.
    """
    model = "gemma-3-27b-it"
    prompt = f"""
    Analyze the following HTML content from a news or blog website.
    Your task is to identify the CSS selector that will reliably target the links to the main articles on the page.
    Focus on the primary list of articles, not sidebars, headers, or footers.

    **HTML Content:**
    ---
    {page_content[:10000]}  # Limit content to avoid exceeding token limits
    ---

    **Instructions:**
    1.  Examine the structure of the HTML to find the repeating pattern for article entries.
    2.  Identify a CSS selector that uniquely targets the `<a>` tags of these articles.
    3.  Provide only the CSS selector as the output.

    **Output Format (Strictly follow this):**
    [Your CSS selector here]
    """

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
        temperature=0.1,  # Very low temperature for precision
    )

    try:
        llm_client = get_llm_client()
        response = llm_client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )
        # The response should be the selector itself
        selector = response.text.strip()
        return selector
    except Exception as e:
        print(
            f"An error occurred while calling the Gemini API for selector generation: {e}"
        )
        return ""
