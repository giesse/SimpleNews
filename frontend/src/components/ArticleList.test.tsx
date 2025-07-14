import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleList from './ArticleList';
import * as api from '@/lib/api';
import { createTestArticle, render } from '@/tests/test-utils';
import { Article, Category } from '@/lib/types';

// Mock the entire API module
jest.mock('@/lib/api');

// Type-safe mock of the API functions
const mockedApi = api as jest.Mocked<typeof api>;

describe('ArticleList', () => {
  // Define a comprehensive set of mock data
  const mockArticles: Article[] = [
    createTestArticle({
      id: 1,
      title: 'First Test Article',
      categories: [{ id: 1, name: 'Technology' }],
      read: false,
      score: 85,
    }),
    createTestArticle({
      id: 2,
      title: 'Second Test Article',
      categories: [{ id: 2, name: 'Science' }],
      read: true,
      score: 45,
    }),
    createTestArticle({
      id: 3,
      title: 'Third Test Article',
      categories: [{ id: 1, name: 'Technology' }],
      read: false,
      score: 95,
    }),
  ];

  const mockCategories: Category[] = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Science' },
  ];

  // Setup a realistic mock for the getArticles API
  beforeEach(() => {
    jest.clearAllMocks();

    // This mock simulates the backend filtering logic
    mockedApi.getArticles.mockImplementation(async (filters) => {
      let articles = [...mockArticles];
      if (filters?.category_id) {
        articles = articles.filter(a => a.categories.some(c => c.id === parseInt(filters.category_id as string, 10)));
      }
      if (filters?.read === false) {
        articles = articles.filter(a => !a.read);
      }
      if (filters?.min_score) {
        articles = articles.filter(a => a.score >= (filters.min_score || 0));
      }
      return articles;
    });

    mockedApi.getCategories.mockResolvedValue(mockCategories);

    mockedApi.markArticleAsRead.mockImplementation(async (articleId, isRead) => {
      const article = mockArticles.find((a) => a.id === articleId);
      if (!article) throw new Error('Article not found');
      return { ...article, read: isRead };
    });
  });

  it('should render a loading state initially and then display articles matching the default filters', async () => {
    render(<ArticleList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for the articles to be displayed
    await screen.findByText('First Test Article');

    // By default, it should only show unread articles with a score of 75 or higher
    expect(screen.getByText('First Test Article')).toBeInTheDocument(); // Unread, score 85
    expect(screen.getByText('Third Test Article')).toBeInTheDocument(); // Unread, score 95
    expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument(); // Read, score 45

    // Verify the initial API call reflects the default filters
    expect(mockedApi.getArticles).toHaveBeenCalledWith({
      read: false,
      min_score: 75,
    });
  });

  it('should filter articles when a category is selected', async () => {
    render(<ArticleList />);
    await screen.findByText('First Test Article'); // Wait for initial load

    // User selects 'Technology'
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    fireEvent.change(categorySelect, { target: { value: '1' } });

    // Check that only Technology articles are visible
    await waitFor(() => {
      expect(screen.getByText('First Test Article')).toBeInTheDocument();
      expect(screen.getByText('Third Test Article')).toBeInTheDocument();
      expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument();
    });

    // Verify the correct API call was made
    expect(mockedApi.getArticles).toHaveBeenLastCalledWith(expect.objectContaining({ category_id: '1' }));
  });

  it('should filter by read status', async () => {
    render(<ArticleList />);
    await screen.findByText('First Test Article'); // Wait for initial load

    // User selects 'Unread Only'
    const readFilter = screen.getByRole('combobox', { name: /article status/i });
    fireEvent.change(readFilter, { target: { value: 'unread' } });

    await waitFor(() => {
      expect(screen.getByText('First Test Article')).toBeInTheDocument();
      expect(screen.getByText('Third Test Article')).toBeInTheDocument();
      expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument();
    });
    
    expect(mockedApi.getArticles).toHaveBeenLastCalledWith(expect.objectContaining({ read: false }));
  });

  it('should filter by minimum interest score', async () => {
    render(<ArticleList />);
    await screen.findByText('First Test Article'); // Wait for initial load

    // User changes the score slider
    const scoreSlider = screen.getByLabelText(/minimum interest score/i);
    fireEvent.change(scoreSlider, { target: { value: '90' } });

    await waitFor(() => {
      expect(screen.getByText('Third Test Article')).toBeInTheDocument();
      expect(screen.queryByText('First Test Article')).not.toBeInTheDocument();
      expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument();
    });

    expect(mockedApi.getArticles).toHaveBeenLastCalledWith(expect.objectContaining({ min_score: 90 }));
  });

  it('should handle combined filters', async () => {
    render(<ArticleList />);
    await screen.findByText('First Test Article');

    // Filter by 'Technology'
    fireEvent.change(screen.getByRole('combobox', { name: /category/i }), { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText('First Test Article')).toBeInTheDocument();
      expect(screen.getByText('Third Test Article')).toBeInTheDocument();
      expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument();
    });

    // Filter by 'Unread'
    fireEvent.change(screen.getByRole('combobox', { name: /article status/i }), { target: { value: 'unread' } });
    // Filter by score
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText((content, element) => content.startsWith('Minimum Interest Score')), { target: { value: '90' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Third Test Article')).toBeInTheDocument();
      expect(screen.queryByText('First Test Article')).not.toBeInTheDocument();
      expect(screen.queryByText('Second Test Article')).not.toBeInTheDocument();
    });

    expect(mockedApi.getArticles).toHaveBeenLastCalledWith({
      category_id: '1',
      read: false,
      min_score: 90,
    });
  });
  
  it('should update an articles read status when the button is clicked', async () => {
    render(<ArticleList />);
    const articleCard = (await screen.findByText('First Test Article')).closest('div.mb-4') as HTMLElement;
    const markReadButton = within(articleCard).getByRole('button', { name: /mark read/i });
    
    fireEvent.click(markReadButton);

    expect(await within(articleCard).findByText(/updating/i)).toBeInTheDocument();
    expect(mockedApi.markArticleAsRead).toHaveBeenCalledWith(1, true);
    expect(await within(articleCard).findByRole('button', { name: /mark unread/i })).toBeInTheDocument();
  });
});