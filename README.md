# News app

I want an app that will scan a number of websites for news. It should remember articles it has already seen (eg. same URL) and not download them again. It should download anything new it hasn't seen before.
New articles will be processed by Gemma running locally in LM Studio. That is http://127.0.0.1:1234, OpenAI-like API:

GET /v1/models

POST /v1/chat/completions

POST /v1/completions

POST /v1/embeddings

Example from LM Studio:

```
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma-3-12b-it",
    "messages": [
      { "role": "system", "content": "Always answer in rhymes. Today is Thursday" },
      { "role": "user", "content": "What day is it today?" }
    ],
    "temperature": 0.7,
    "max_tokens": -1,
    "stream": false
}'
```

The goal is to summarize and categorize every article; then based on the categories, show me new articles that might interest me. I should be able to refine in the UI the prompt for what I find interesting and what not. (Perhaps liking or disliking an article could automatically update the prompt.)
I want to see a summary of each article, be able to click in it to go to the original article, and maybe ask questions about an article.
Challenge: The max context length I can run locally with this model is 8192 tokens, which might cause us issues. We need to carefully plan for this limitation.

Questions:
- What frameworks / stack / languages / etc. is best suited for this?
- Assume we are using a Devcontainer
- Do you have any suggestions?

I want a solid, detailed plan before we write any code. It's also important that we keep good documentation always up to date, in particular explaning WHY we made any choice we made.