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

    # 2. Create a mock source and article in the database
    source_in = schemas.SourceCreate(name="Test Source", url="http://test.com")
    db_source = crud.create_source(db=db, source=source_in)
    article_in = schemas.ArticleCreate(
        url="http://example.com/test-article",
        title="Test Article",
        original_content="This is the original content of the test article.",
        source_id=db_source.id,
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


@pytest.mark.asyncio
async def test_read_categories(client, db):
    """
    Test the endpoint for reading categories.
    """
    # 1. Create a mock source and article
    source_in = schemas.SourceCreate(name="Test Source", url="http://test.com")
    db_source = crud.create_source(db=db, source=source_in)
    article_in = schemas.ArticleCreate(
        url="http://example.com/test-article",
        title="Test Article",
        original_content="Some content",
        source_id=db_source.id,
    )
    db_article = crud.create_article(db=db, article=article_in)

    # 2. Create some categories in the database
    crud.link_categories_to_article(db, article_id=db_article.id, categories=["Tech", "Science"])

    # 3. Send a GET request to the endpoint
    response = await client.get("/categories/")

    # 4. Assert the response
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert {cat['name'] for cat in data} == {"Tech", "Science"}


@pytest.mark.asyncio
async def test_mark_article_read(client, db):
    """
    Test marking an article as read.
    """
    # 1. Create a mock source and article
    source_in = schemas.SourceCreate(name="Test Source", url="http://test.com")
    db_source = crud.create_source(db=db, source=source_in)
    article_in = schemas.ArticleCreate(
        url="http://example.com/test-article",
        title="Test Article",
        original_content="Some content",
        source_id=db_source.id,
    )
    db_article = crud.create_article(db=db, article=article_in)
    assert db_article.read is False  # Initially, article is unread

    # 2. Mark the article as read
    response = await client.patch(
        f"/articles/{db_article.id}/read-status", json={"read": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["read"] is True

    # 3. Verify the change in the database
    updated_article = crud.get_article(db, article_id=db_article.id)
    assert updated_article.read is True

    # 4. Mark the article as unread
    response = await client.patch(
        f"/articles/{db_article.id}/read-status", json={"read": False}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["read"] is False

    # 5. Verify the change in the database
    updated_article = crud.get_article(db, article_id=db_article.id)
    assert updated_article.read is False


@pytest.mark.asyncio
async def test_filter_articles_by_read_status(client, db):
    """
    Test filtering articles by their read status.
    """
    # 1. Create a mock source
    source_in = schemas.SourceCreate(name="Test Source", url="http://test.com")
    db_source = crud.create_source(db=db, source=source_in)

    # 2. Create one read and one unread article
    read_article_in = schemas.ArticleCreate(
        url="http://example.com/read-article",
        title="Read Article",
        original_content="This article has been read.",
        source_id=db_source.id,
        read=True,
    )
    crud.create_article(db=db, article=read_article_in)

    unread_article_in = schemas.ArticleCreate(
        url="http://example.com/unread-article",
        title="Unread Article",
        original_content="This article has not been read.",
        source_id=db_source.id,
        read=False,
    )
    crud.create_article(db=db, article=unread_article_in)

    # 3. Fetch unread articles
    response = await client.get("/articles/", params={"read": False})

    # 4. Assert the response
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 1
    assert data[0]["title"] == "Unread Article"
    assert data[0]["read"] is False
