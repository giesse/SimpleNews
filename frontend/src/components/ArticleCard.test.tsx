import { fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleCard from './ArticleCard';
import * as api from '@/lib/api';
import { createTestArticle, render } from '@/tests/test-utils';

// Mock the API functions
jest.mock('@/lib/api', () => ({
  markArticleAsRead: jest.fn(),
}));

describe('ArticleCard', () => {
  const mockArticle = createTestArticle();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (api.markArticleAsRead as jest.Mock).mockResolvedValue(mockArticle);
  });

  it('renders article information correctly', () => {
    render(<ArticleCard article={mockArticle} />);
    
    // Verify that the article title is displayed
    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    
    // Verify that the summary is displayed
    expect(screen.getByText(mockArticle.summary)).toBeInTheDocument();
    
    // Verify that the date is displayed in a formatted way
    // We can't check the exact string due to localization, but we can check for parts
    const year = new Date(mockArticle.created_at).getFullYear();
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
    
    // Verify the read original link
    const link = screen.getByText('Read Original');
    expect(link).toHaveAttribute('href', mockArticle.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders categories correctly', () => {
    render(<ArticleCard article={mockArticle} />);
    
    // Verify each category is displayed
    mockArticle.categories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  it('renders as unread by default', () => {
    render(<ArticleCard article={mockArticle} />);
    
    // Verify the mark read button is displayed
    expect(screen.getByText('Mark Read')).toBeInTheDocument();
    
    // Verify the article has full opacity when unread
    const articleContainer = screen.getByText(mockArticle.title).closest('div');
    expect(articleContainer?.parentElement).toHaveClass('opacity-100');
    expect(articleContainer?.parentElement).not.toHaveClass('opacity-75');
  });

  it('renders as read when isRead prop is true', () => {
    render(<ArticleCard article={mockArticle} isRead={true} />);
    
    // Verify the mark unread button is displayed
    expect(screen.getByText('Mark Unread')).toBeInTheDocument();
    
    // Verify the article has reduced opacity when read
    const articleContainer = screen.getByText(mockArticle.title).closest('div');
    expect(articleContainer?.parentElement).toHaveClass('opacity-75');
    expect(articleContainer?.parentElement).not.toHaveClass('opacity-100');
  });

  it('toggles read status when button is clicked', async () => {
    const mockOnReadStatusChange = jest.fn();
    
    render(
      <ArticleCard 
        article={mockArticle} 
        isRead={false} 
        onReadStatusChange={mockOnReadStatusChange} 
      />
    );
    
    // Click the "Mark Read" button
    fireEvent.click(screen.getByText('Mark Read'));
    
    // Verify the callback was called with the new status
    expect(mockOnReadStatusChange).toHaveBeenCalledWith(true);
    
    // Verify the API was called
    await waitFor(() => {
      expect(api.markArticleAsRead).toHaveBeenCalledWith(mockArticle.id, true);
    });
  });

  it('handles errors when API call fails', async () => {
    // Mock the API to reject
    (api.markArticleAsRead as jest.Mock).mockRejectedValue(new Error('API error'));
    
    // Mock alert
    const originalAlert = window.alert;
    window.alert = jest.fn();
    
    const mockOnReadStatusChange = jest.fn();
    
    render(
      <ArticleCard 
        article={mockArticle} 
        isRead={false} 
        onReadStatusChange={mockOnReadStatusChange} 
      />
    );
    
    // Click the "Mark Read" button
    fireEvent.click(screen.getByText('Mark Read'));
    
    // Verify the callback was called with the new status initially
    expect(mockOnReadStatusChange).toHaveBeenCalledWith(true);
    
    // Verify the API was called
    await waitFor(() => {
      expect(api.markArticleAsRead).toHaveBeenCalledWith(mockArticle.id, true);
    });
    
    // Verify the alert was shown
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Failed to update article status'));
    });
    
    // Verify the callback was called again with the original status to revert the change
    await waitFor(() => {
      expect(mockOnReadStatusChange).toHaveBeenCalledWith(false);
    });
    
    // Restore alert
    window.alert = originalAlert;
  });

  it('shows loading state during API call', async () => {
    // Create a promise that we can resolve manually
    let resolveApiCall: (value: unknown) => void = () => {};
    const apiPromise = new Promise<unknown>(resolve => {
      resolveApiCall = resolve;
    });
    
    (api.markArticleAsRead as jest.Mock).mockReturnValue(apiPromise);
    
    render(
      <ArticleCard 
        article={mockArticle} 
        isRead={false} 
        onReadStatusChange={jest.fn()} 
      />
    );
    
    // Click the "Mark Read" button
    fireEvent.click(screen.getByText('Mark Read'));
    
    // Verify the button changes to loading state
    expect(screen.getByText('Updating...')).toBeInTheDocument();
    
    // Verify the button is disabled
    expect(screen.getByText('Updating...')).toBeDisabled();
    
    // Resolve the API call
    resolveApiCall(mockArticle);
    
    // Verify the button returns to normal state
    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    });
  });

  it('renders with an empty categories array', () => {
    const articleWithoutCategories = createTestArticle({ categories: [] });
    
    const { container } = render(<ArticleCard article={articleWithoutCategories} />);
    
    // Verify that the article title is still displayed
    expect(screen.getByText(articleWithoutCategories.title)).toBeInTheDocument();
    
    // Verify that no category tags are displayed
    const categoryContainer = container.querySelector('[data-testid="category-container"]');
    expect(categoryContainer?.children.length).toBe(0);
  });
});