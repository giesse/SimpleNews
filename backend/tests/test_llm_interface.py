
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
