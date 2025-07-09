import os
import pytest
from unittest.mock import patch
from backend.app import llm_interface


def test_get_llm_client_raises_error_if_key_not_set():
    """
    Tests that the get_llm_client function raises a ValueError if the GEMINI_API_KEY is not set.
    """
    # Ensure the environment variable is not set
    if "GEMINI_API_KEY" in os.environ:
        del os.environ["GEMINI_API_KEY"]

    llm_interface.client = None

    with pytest.raises(ValueError, match="GEMINI_API_KEY environment variable not set"):
        llm_interface.get_llm_client()


@patch("google.genai.Client")
def test_get_llm_client_uses_api_key(mock_client):
    """
    Tests that the get_llm_client function uses the GEMINI_API_KEY environment variable.
    """
    # Set the environment variable
    os.environ["GEMINI_API_KEY"] = "test_api_key"

    llm_interface.client = None

    # Call the function
    client = llm_interface.get_llm_client()

    # Check that the client was initialized with the correct API key
    mock_client.assert_called_with(api_key="test_api_key")

    # Clean up the environment variable
    del os.environ["GEMINI_API_KEY"]


@patch("backend.app.llm_interface.get_llm_client")
def test_generate_summary_and_categories(mock_get_llm_client):
    """
    Tests the successful generation of a summary and categories from article text.
    """
    # Mock the response from the Gemini API
    mock_response_text = """
    Summary: This is a test summary.
    Categories: Tech, AI, Testing
    """
    mock_llm_client = mock_get_llm_client.return_value
    mock_llm_client.models.generate_content_stream.return_value = [
        type("obj", (object,), {"text": mock_response_text})()
    ]

    # Call the function
    summary, categories = llm_interface.generate_summary_and_categories("Test article")

    # Assert the results
    assert summary == "This is a test summary."
    assert categories == ["Tech", "AI", "Testing"]


@patch("backend.app.llm_interface.get_llm_client")
def test_generate_interest_score(mock_get_llm_client):
    """
    Tests the successful generation of an interest score.
    """
    # Mock the response from the Gemini API
    mock_response = type("obj", (object,), {"text": "85"})()
    mock_llm_client = mock_get_llm_client.return_value
    mock_llm_client.models.generate_content.return_value = mock_response

    # Call the function
    score = llm_interface.generate_interest_score(
        "Some article text", "Interested in technology"
    )

    # Assert the result
    assert score == 85


@patch("backend.app.llm_interface.get_llm_client")
def test_find_article_link_selector(mock_get_llm_client):
    """
    Tests the successful identification of a CSS selector for article links.
    """
    # Mock the response from the Gemini API
    mock_response = type("obj", (object,), {"text": "a.article-link"})()
    mock_llm_client = mock_get_llm_client.return_value
    mock_llm_client.models.generate_content.return_value = mock_response

    # Call the function
    selector = llm_interface.find_article_link_selector("<html>...</html>")

    # Assert the result
    assert selector == "a.article-link"


@patch("backend.app.llm_interface.get_llm_client")
def test_generate_summary_and_categories_with_none_in_stream(mock_get_llm_client):
    """
    Tests that the generate_summary_and_categories function handles None values in the response stream.
    """
    # Mock the response from the Gemini API to include a chunk with None
    mock_llm_client = mock_get_llm_client.return_value
    mock_llm_client.models.generate_content_stream.return_value = [
        type("obj", (object,), {"text": "Summary: This is a test summary.\n"})(),
        type("obj", (object,), {"text": None})(),
        type("obj", (object,), {"text": "Categories: Tech, AI, Testing"})(),
    ]

    # Call the function
    summary, categories = llm_interface.generate_summary_and_categories("Test article")

    # Assert the results
    assert summary == "This is a test summary."
    assert categories == ["Tech", "AI", "Testing"]
