import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';

// Mock the child components
jest.mock('@/components/ArticleList', () => {
  return function MockArticleList() {
    return <div data-testid="mock-article-list">Article List Component</div>;
  };
});

jest.mock('@/components/SourcesModal', () => {
  return function MockSourcesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? (
      <div data-testid="mock-sources-modal">
        Sources Modal Component
        <button data-testid="close-modal-button" onClick={onClose}>Close Modal</button>
      </div>
    ) : null;
  };
});

// No need to mock API since we're mocking the ArticleList component

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a heading and ArticleList component', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', {
      name: /personalized news feed/i,
    });
    expect(heading).toBeInTheDocument();
    expect(screen.getByTestId('mock-article-list')).toBeInTheDocument();
  });

  it('shows SourcesModal when "Manage Sources" button is clicked', () => {
    render(<Home />);

    // Modal should initially be closed
    expect(screen.queryByTestId('mock-sources-modal')).not.toBeInTheDocument();

    // Click the "Manage Sources" button
    fireEvent.click(screen.getByText('Manage Sources'));

    // Modal should now be open
    expect(screen.getByTestId('mock-sources-modal')).toBeInTheDocument();
  });

  it('closes SourcesModal when onClose is triggered', () => {
    render(<Home />);

    // Open the modal
    fireEvent.click(screen.getByText('Manage Sources'));
    expect(screen.getByTestId('mock-sources-modal')).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByTestId('close-modal-button'));
    
    // Modal should now be closed
    expect(screen.queryByTestId('mock-sources-modal')).not.toBeInTheDocument();
  });

  it('has accessible button for managing sources', () => {
    render(<Home />);

    // Check that the button has appropriate attributes
    const button = screen.getByRole('button', { name: /manage sources/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-500');
  });
});