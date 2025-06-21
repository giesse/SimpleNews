import { render, screen } from '@testing-library/react';
import Home from './page';
import { getArticles } from '@/lib/api';
import { Article } from '@/lib/types';

jest.mock('@/lib/api');
const mockGetArticles = getArticles as jest.Mock;

describe('Home', () => {
  it('renders a heading and articles', async () => {
    const mockArticles: Article[] = [
      { id: 1, title: 'Test Article 1', url: 'http://test.com/1', summary: 'Summary 1', created_at: '2025-06-21T12:00:00Z', categories: [] },
    ];
    mockGetArticles.mockResolvedValue(mockArticles);

    render(<Home />);

    const heading = screen.getByRole('heading', {
      name: /personalized news feed/i,
    });
    expect(heading).toBeInTheDocument();

    const articleTitle = await screen.findByText('Test Article 1');
    expect(articleTitle).toBeInTheDocument();
  });
});