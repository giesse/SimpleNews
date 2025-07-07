
import os
from dotenv import load_dotenv
import pytest

def test_load_dotenv():
    """
    Tests if the .env file is loaded correctly.
    """
    # Create a dummy .env file for testing
    with open("backend/.env_test", "w") as f:
        f.write("TEST_API_KEY=test_value")

    # Load the dummy .env file
    load_dotenv(dotenv_path="backend/.env_test")

    # Check if the environment variable is set
    api_key = os.environ.get("TEST_API_KEY")
    assert api_key == "test_value"

    # Clean up the dummy .env file and environment variable
    os.remove("backend/.env_test")
    del os.environ["TEST_API_KEY"]
