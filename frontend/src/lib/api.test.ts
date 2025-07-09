import * as api from './api';

describe('api', () => {
  afterEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('getInterestPrompt should call fetch with the correct url', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ interest_prompt: 'test prompt' }),
    });
    await api.getInterestPrompt();
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/settings/interest_prompt', undefined);
  });

  it('updateInterestPrompt should call fetch with the correct url and body', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ interest_prompt: 'new prompt', message: 'success' }),
    });
    await api.updateInterestPrompt('new prompt');
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/settings/interest_prompt', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interest_prompt: 'new prompt' }),
    });
  });

  it('recalculateAllArticleScores should call fetch with the correct url', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ job_id: '123', message: 'success' }),
    });
    await api.recalculateAllArticleScores();
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/articles/recalculate-scores', {
      method: 'POST',
    });
  });

  it('getArticles should call fetch with the correct url when min_score is provided', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    await api.getArticles({ min_score: 50 });
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/articles/?min_score=50', undefined);
  });
});
