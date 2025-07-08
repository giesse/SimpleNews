import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SourceList from './SourceList';
import * as api from '../lib/api';
import { Source } from '../lib/types';

// Mock the API functions
jest.mock('../lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockSources: Source[] = [
  { id: 1, name: 'Source 1', url: 'http://source1.com', last_scraped_at: null },
  { id: 2, name: 'Source 2', url: 'http://source2.com', last_scraped_at: null },
];

describe('SourceList', () => {
  beforeEach(() => {
    mockedApi.getSources.mockResolvedValue(mockSources);
    mockedApi.deleteSource.mockResolvedValue({ id: 1, name: 'Source 1', url: 'http://source1.com', last_scraped_at: null });
    mockedApi.scrapeSource.mockResolvedValue({ job_id: '123', message: 'Scraping started' });
    mockedApi.getScrapeJobStatus.mockResolvedValue({
      id: '123',
      status: 'in_progress',
      progress: 0.5,
      message: 'Scraping in progress',
      created_at: new Date().toISOString()
    });
    global.alert = jest.fn();
    // Mock confirm to return true
    global.confirm = jest.fn(() => true);
    // Mock setInterval and clearInterval
    jest.useFakeTimers();
  });

  it('renders a list of sources', async () => {
    render(<SourceList />);
    await waitFor(() => {
      expect(screen.getByText('Source 1')).toBeInTheDocument();
      expect(screen.getByText('Source 2')).toBeInTheDocument();
    });
  });

  it('calls deleteSource when the delete button is clicked', async () => {
    render(<SourceList />);
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Delete')[0]);
    });
    await waitFor(() => {
      expect(mockedApi.deleteSource).toHaveBeenCalledWith(1);
    });
  });

  it('calls scrapeSource when the scrape button is clicked', async () => {
    render(<SourceList />);
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Scrape')[0]);
    });
    await waitFor(() => {
      expect(mockedApi.scrapeSource).toHaveBeenCalledWith(1);
    });
  });
});