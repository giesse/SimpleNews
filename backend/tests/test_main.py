import pytest
from httpx import AsyncClient, ASGITransport

from app import crud, schemas
from app.main import app


@pytest.mark.asyncio
async def test_read_root():
    """
    Test the root endpoint of the application.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}


@pytest.mark.asyncio
async def test_process_article_endpoint(client, db, mocker):
    """
    Test the article processing endpoint.
    """
    # 1. Mock the LLM interface
    mocked_summary = "This is a mocked summary."
    mocked_categories = ["mocked", "testing"]
    mocker.patch(
        "app.main.llm_interface.generate_summary_and_categories",
        return_value=(mocked_summary, mocked_categories),
    )

    # 2. Create a mock article in the database
    article_in = schemas.ArticleCreate(
        url="http://example.com/test-article",
        title="Test Article",
        original_content="This is the original content of the test article.",
    )
    db_article = crud.create_article(db=db, article=article_in)

    # 3. Send a POST request to the endpoint
    response = await client.post(f"/articles/{db_article.id}/process")

    # 4. Assert the response status code
    assert response.status_code == 200
    assert response.json() == {
        "message": "Article processed successfully",
        "article_id": db_article.id,
    }

    # 5. Assert that the article's summary and categories are updated
    updated_article = crud.get_article(db, article_id=db_article.id)
    assert updated_article.summary == mocked_summary

    # Check that the categories have been linked correctly
    category_names = sorted([category.name for category in updated_article.categories])
    assert category_names == sorted(mocked_categories)


@pytest.mark.asyncio
async def test_source_crud(client, db):
    """
    Test CRUD operations for sources.
    """
    # 1. Create a source
    source_in = {"name": "Test Source", "url": "http://testsource.com"}
    response = await client.post("/sources/", json=source_in)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == source_in["name"]
    assert data["url"] == source_in["url"]
    assert "id" in data
    source_id = data["id"]

    # 2. Read the source
    response = await client.get(f"/sources/{source_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == source_in["name"]
    assert data["url"] == source_in["url"]

    # 3. Read all sources
    response = await client.get("/sources/")
    assert response.status_code == 200
    assert len(response.json()) > 0

    # 4. Update the source
    update_data = {"name": "Updated Test Source"}
    response = await client.put(f"/sources/{source_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]

    # 5. Delete the source
    response = await client.delete(f"/sources/{source_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == source_id

    # Verify deletion
    response = await client.get(f"/sources/{source_id}")
    assert response.status_code == 404
