import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SourceForm from './SourceForm';
import * as api from '../lib/api';

// Mock the API functions
jest.mock('../lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('SourceForm', () => {
  it('renders the form and submits new source data', async () => {
    const mockOnSourceCreated = jest.fn();
    render(<SourceForm onSourceCreated={mockOnSourceCreated} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Source' } });
    fireEvent.change(screen.getByLabelText(/url/i), { target: { value: 'http://newsource.com' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add source/i }));

    // Wait for the API call
    await waitFor(() => {
      expect(mockedApi.createSource).toHaveBeenCalledWith({
        name: 'New Source',
        url: 'http://newsource.com',
        scraper_type: 'Auto',
        config: { article_link_selector: '' },
      });
    });

    // Check if the callback was called
    await waitFor(() => {
      expect(mockOnSourceCreated).toHaveBeenCalled();
    });
  });
});