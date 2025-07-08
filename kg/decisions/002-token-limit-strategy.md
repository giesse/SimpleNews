# ADR-002: Token Limit Strategy for LLM Summarization

## Status

Accepted

## Context

The initial project plan included a "Token Limit Strategy" to handle articles that might exceed the context window of the LLM. The proposed solution was an iterative map-reduce summarization approach. This was based on the assumption that we might encounter articles larger than the LLM's context window.

## Decision

We have decided **not to implement** a token limit strategy at this time.

The primary reasons for this decision are:
1.  **Large Context Window**: The selected LLM, Gemma, has a 128k token context window. This is sufficiently large to handle the vast majority of online news articles and blog posts.
2.  **Low Probability of Occurrence**: The likelihood of encountering an article that exceeds this limit is extremely low. The complexity of implementing and maintaining a map-reduce summarization strategy outweighs the benefit for such a rare edge case.
3.  **Simplification**: Avoiding this feature simplifies the initial implementation and reduces maintenance overhead, allowing us to focus on core features.

## Consequences

- The application will not be able to process articles that are larger than the 128k token limit. In the unlikely event that such an article is encountered, the LLM call will fail, and the article will not be summarized.
- We will monitor for any issues related to this and can reconsider this decision if it becomes a problem in the future.
