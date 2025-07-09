import { fireEvent, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleList from './ArticleList';
import * as api from '@/lib/api';
import { createTestArticle, render } from '@/tests/test-utils';
import { Article } from '@/lib/types';

// Mock the entire API module
jest.mock('@/lib/api');

// Type-safe mock of the API functions
const mockedApi = api as jest.Mocked<typeof api>;

describe('ArticleList', () => {
  const mockArticles: Article[] = [
    createTestArticle({
      id: 1,
      title: 'First Test Article',
      categories: [{ id: 1, name: 'Technology' }],
      read: false,
    }),
    createTestArticle({
      id: 2,
      title: 'Second Test Article',
      categories: [{ id: 2, name: 'Science' }],
      read: true,
    }),
  ];

  beforeEach(() => {
    // Clear mock history and set default mock implementations before each test
    jest.clearAllMocks();
    mockedApi.getArticles.mockResolvedValue(mockArticles);
    mockedApi.markArticleAsRead.mockImplementation(async (articleId, isRead) => {
      const article = mockArticles.find((a) => a.id === articleId);
      if (!article) throw new Error('Article not found');
      return { ...article, read: isRead };
    });
  });

  it('should render a loading state initially and then display articles', async () => {
    render(<ArticleList />);
    // Check for loading state first
    expect(screen.getByText(/loading your personalized news feed/i)).toBeInTheDocument();

    // Wait for the articles to be rendered
    expect(await screen.findByText('First Test Article')).toBeInTheDocument();
    expect(screen.getByText('Second Test Article')).toBeInTheDocument();

    // Ensure the loading state is gone
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('should display an error message if the API call fails', async () => {
    const errorMessage = 'Failed to fetch articles';
    mockedApi.getArticles.mockRejectedValue(new Error(errorMessage));

    render(<ArticleList />);

    // Wait for the error message to be displayed
    expect(await screen.findByText(/error loading articles/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display an empty state message when no articles are returned', async () => {
    mockedApi.getArticles.mockResolvedValue([]);
    render(<ArticleList />);

    // Wait for the empty state message
    expect(await screen.findByText(/no articles found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adding some news sources/i)).toBeInTheDocument();
  });

  it('should filter articles when a category is selected', async () => {
    render(<ArticleList />);
    // Wait for initial articles to load
    await screen.findByText('First Test Article');

    // Mock the API response for the filtered query
    const filteredArticles = [mockArticles[0]];
    mockedApi.getArticles.mockResolvedValue(filteredArticles);

    // Select a category from the dropdown
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(categorySelect, { target: { value: '1' } }); // ID for 'Technology'

    // Wait for the filtered article to appear
    expect(await screen.findByText('First Test Article')).toBeInTheDocument();

    // Assert that the other article is no longer present
    expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument();

    // Verify the API was called with the correct filter
    expect(mockedApi.getArticles).toHaveBeenCalledWith({ category_id: '1' });
  });

  it('should update an articles read status when the button is clicked', async () => {
    render(<ArticleList />);

    // Find the specific article card we want to interact with
    const articleCard = (await screen.findByText('First Test Article')).closest('div.mb-4') as HTMLElement;
    expect(articleCard).not.toBeNull();

    // Find the button within that card and click it
    const markReadButton = within(articleCard).getByRole('button', { name: /mark read/i });
    fireEvent.click(markReadButton);

    // Check for the temporary updating state
    expect(await within(articleCard).findByText(/updating/i)).toBeInTheDocument();

    // Verify the API was called correctly
    expect(mockedApi.markArticleAsRead).toHaveBeenCalledWith(1, true);

    // Wait for the button text to change to its final state
    expect(await within(articleCard).findByRole('button', { name: /mark unread/i })).toBeInTheDocument();
  });

  it('should filter articles by minimum interest score', async () => {
    render(<ArticleList />);
    // Wait for initial articles to load
    await screen.findByText('First Test Article');

    // Mock the API response for the filtered query
    const filteredArticles = [mockArticles[0]];
    mockedApi.getArticles.mockResolvedValue(filteredArticles);
    mockedApi.getArticles.mockClear();

    // Change the minimum score slider
    const scoreSlider = screen.getByLabelText(/minimum interest score/i);
    fireEvent.change(scoreSlider, { target: { value: '50' } });

    // Wait for the filtered article to appear
    expect(await screen.findByText('First Test Article')).toBeInTheDocument();

    // Assert that the other article is no longer present
    expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument();

    // Verify the API was called with the correct filter
    expect(mockedApi.getArticles).toHaveBeenCalledWith(
      expect.objectContaining({
        min_score: 50,
      })
    );
  });
});
