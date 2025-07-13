import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SourcesModal from './SourcesModal';
import * as api from '@/lib/api';
import { render } from '@/tests/test-utils';

// Mock child components and API
jest.mock('./Modal', () => (props: any) => props.isOpen ? <div data-testid="mock-modal">{props.children}</div> : null);
jest.mock('./SourceList', () => () => <div data-testid="mock-source-list" />);
jest.mock('./SourceForm', () => (props: any) => <button onClick={props.onSourceCreated}>Create Source</button>);
jest.mock('./LoadingIndicator', () => (props: any) => <div data-testid="mock-loading-indicator">{props.message}</div>);
jest.mock('./ScrapingProgress', () => (props: any) => <div data-testid="mock-scraping-progress">{props.job.message}</div>);
jest.mock('@/lib/api');

const mockedApi = api as jest.Mocked<typeof api>;

describe('SourcesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when open', () => {
    render(<SourcesModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('should handle legacy scraping (no job_id)', async () => {
    mockedApi.scrapeAllSources.mockResolvedValue({ message: 'Legacy scrape initiated' });
    render(<SourcesModal isOpen={true} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /scrape all sources/i }));

    await waitFor(() => {
      expect(screen.getByText('Legacy scrape initiated')).toBeInTheDocument();
    });
  });

  it('should initiate scraping, poll for status, and show completion', async () => {
    jest.useFakeTimers();

    mockedApi.scrapeAllSources.mockResolvedValue({ job_id: 'job-123', message: 'Scraping initiated' });
    mockedApi.getScrapeJobStatus
      .mockResolvedValueOnce({ id: 'job-123', status: 'in_progress', progress: 50, message: 'In progress...', total_sources: 10, processed_sources: 5, total_articles: 100, processed_articles: 50, eta_seconds: 60 })
      .mockResolvedValueOnce({ id: 'job-123', status: 'completed', progress: 100, message: 'Complete!', total_sources: 10, processed_sources: 10, total_articles: 100, processed_articles: 100, eta_seconds: 0 });

    render(<SourcesModal isOpen={true} onClose={() => {}} />);

    // 1. Click the scrape button and wait for the initial loading state
    fireEvent.click(screen.getByRole('button', { name: /scrape all sources/i }));
    await screen.findByText('Scraping...');

    // 2. The first poll happens immediately. Wait for its result to appear.
    const progress = await screen.findByTestId('mock-scraping-progress');
    expect(progress).toHaveTextContent('In progress...');

    // 3. Now, advance timers to trigger the second poll via setTimeout.
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // 4. Wait for the completion message.
    await screen.findByText('Complete!');

    // 5. The progress indicator should be gone, and the button re-enabled.
    expect(screen.queryByTestId('mock-scraping-progress')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scrape all sources/i })).not.toBeDisabled();

    jest.useRealTimers();
  });
});