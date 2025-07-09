import pytest
from app import crud, schemas


@pytest.mark.asyncio
async def test_settings_interest_prompt(client, db):
    """
    Test setting and getting the interest prompt.
    """
    # Test default/initial value
    response = await client.get("/settings/interest_prompt")
    assert response.status_code == 200
    # Just verify we get a response, we don't need to store it
    assert "interest_prompt" in response.json()

    # Set a new interest prompt
    new_prompt = "Technology, AI, Programming, Data Science"
    response = await client.put(
        "/settings/interest_prompt", json={"interest_prompt": new_prompt}
    )
    assert response.status_code == 200
    assert response.json()["interest_prompt"] == new_prompt

    # Verify the prompt was updated
    response = await client.get("/settings/interest_prompt")
    assert response.status_code == 200
    assert response.json()["interest_prompt"] == new_prompt


@pytest.mark.asyncio
async def test_article_scoring(client, db, mocker):
    """
    Test calculating interest scores for articles.
    """
    # Set up a test interest prompt
    test_prompt = "Technology, Artificial Intelligence"
    await client.put("/settings/interest_prompt", json={"interest_prompt": test_prompt})

    # Mock the LLM interface
    mocked_score = 85
    mocker.patch(
        "app.main.llm_interface.generate_interest_score",
        return_value=mocked_score,
    )

    # Create a mock source and article
    source_in = schemas.SourceCreate(name="Test Source", url="http://test.com")
    db_source = crud.create_source(db=db, source=source_in)
    article_in = schemas.ArticleCreate(
        url="http://example.com/test-article",
        title="Test Article",
        original_content="This is a test article about artificial intelligence and machine learning.",
        source_id=db_source.id,
    )
    db_article = crud.create_article(db=db, article=article_in)

    # Calculate the article's interest score
    response = await client.post(f"/articles/{db_article.id}/score")

    # Assert the response
    assert response.status_code == 200
    assert response.json() == {
        "message": "Article scored successfully",
        "article_id": db_article.id,
        "interest_score": mocked_score,
    }

    # Verify the article's score was updated in the database
    updated_article = crud.get_article(db, article_id=db_article.id)
    assert updated_article.interest_score == mocked_score


@pytest.mark.asyncio
async def test_article_filtering_by_score(client, db, mocker):
    """
    Test filtering articles by minimum interest score.
    """
    # Create a mock source
    source_in = schemas.SourceCreate(name="Test Source", url="http://test.com")
    db_source = crud.create_source(db=db, source=source_in)

    # Create several articles with different scores
    articles_data = [
        {"title": "High Score Article", "score": 90},
        {"title": "Medium Score Article", "score": 60},
        {"title": "Low Score Article", "score": 30},
        {"title": "Zero Score Article", "score": 0},
    ]

    for article_data in articles_data:
        article_in = schemas.ArticleCreate(
            url=f"http://example.com/{article_data['title'].lower().replace(' ', '-')}",
            title=article_data["title"],
            original_content=f"This is {article_data['title']}",
            source_id=db_source.id,
        )
        db_article = crud.create_article(db=db, article=article_in)
        crud.update_article_interest_score(
            db, article_id=db_article.id, interest_score=article_data["score"]
        )

    # Test without filtering (should return all articles)
    response = await client.get("/articles/")
    assert response.status_code == 200
    all_articles = response.json()
    assert len(all_articles) == len(articles_data)

    # Check sorting by interest score (descending)
    assert all_articles[0]["interest_score"] == 90
    assert all_articles[1]["interest_score"] == 60
    assert all_articles[2]["interest_score"] == 30
    assert all_articles[3]["interest_score"] == 0

    # Test with minimum score filter of 50
    response = await client.get("/articles/?min_score=50")
    assert response.status_code == 200
    filtered_articles = response.json()
    assert len(filtered_articles) == 2
    assert filtered_articles[0]["interest_score"] == 90
    assert filtered_articles[1]["interest_score"] == 60

    # Test with minimum score filter of 80
    response = await client.get("/articles/?min_score=80")
    assert response.status_code == 200
    filtered_articles = response.json()
    assert len(filtered_articles) == 1
    assert filtered_articles[0]["interest_score"] == 90


@pytest.mark.asyncio
async def test_bulk_article_scoring(client, db, mocker):
    """
    Test bulk recalculation of interest scores for all articles.
    """
    # Set up a test interest prompt
    test_prompt = "Technology, Artificial Intelligence"
    await client.put("/settings/interest_prompt", json={"interest_prompt": test_prompt})

    # Mock the LLM interface
    mocked_scores = [85, 65, 40]
    mock_generate_score = mocker.patch(
        "app.main.llm_interface.generate_interest_score",
        side_effect=mocked_scores,
    )

    # Create a mock source
    source_in = schemas.SourceCreate(name="Test Source", url="http://test.com")
    db_source = crud.create_source(db=db, source=source_in)

    # Create several test articles
    article_data = [
        {"title": "AI Article", "content": "This is about artificial intelligence."},
        {"title": "Tech Article", "content": "This is about technology."},
        {"title": "Other Article", "content": "This is about something else."},
    ]

    for data in article_data:
        article_in = schemas.ArticleCreate(
            url=f"http://example.com/{data['title'].lower().replace(' ', '-')}",
            title=data["title"],
            original_content=data["content"],
            source_id=db_source.id,
        )
        crud.create_article(db=db, article=article_in)

    # Call the bulk scoring endpoint
    response = await client.post("/articles/recalculate-scores")

    # Assert the response
    assert response.status_code == 202  # Accepted - long-running task
    assert "job_id" in response.json()
    assert "message" in response.json()

    # Verify that the generate_interest_score was called for each article
    assert mock_generate_score.call_count == len(article_data)

    # Get the articles to verify their scores
    response = await client.get("/articles/")
    articles = response.json()

    # Articles should be returned sorted by interest_score (highest first)
    assert len(articles) == len(article_data)
    assert articles[0]["interest_score"] == 85
    assert articles[1]["interest_score"] == 65
    assert articles[2]["interest_score"] == 40
