import { fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SourcesModal from './SourcesModal';
import * as api from '@/lib/api';
import { render } from '@/tests/test-utils';

// Mock child components and API
jest.mock('./Modal', () => (props: any) => props.isOpen ? <div data-testid="mock-modal">{props.children}</div> : null);
jest.mock('./SourceList', () => () => <div data-testid="mock-source-list" />);
jest.mock('./SourceForm', () => (props: any) => <button onClick={props.onSourceCreated}>Create Source</button>);
jest.mock('./LoadingIndicator', () => (props: any) => <div data-testid="mock-loading-indicator">{props.message}</div>);
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

  it('should initiate scraping and show completion', async () => {
    mockedApi.scrapeAllSources.mockResolvedValue({ job_id: 'job-123', message: 'Scraping initiated' });
    mockedApi.getScrapeJobStatus.mockResolvedValue({ id: 'job-123', status: 'completed', progress: 100, message: 'Complete' });

    render(<SourcesModal isOpen={true} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /scrape all sources/i }));

    await waitFor(() => {
        expect(screen.getByTestId('mock-loading-indicator')).toHaveTextContent('Complete');
    }, { timeout: 5000 });
  });
});