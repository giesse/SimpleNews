import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsModal from './SettingsModal';
import * as api from '@/lib/api';
import { render } from '@/tests/test-utils';

// Mock the entire API module
jest.mock('@/lib/api');

// Type-safe mock of the API functions
const mockedApi = api as jest.Mocked<typeof api>;

describe('SettingsModal', () => {
  beforeEach(() => {
    // Clear mock history and set default mock implementations before each test
    jest.clearAllMocks();
    mockedApi.getInterestPrompt.mockResolvedValue({ interest_prompt: 'test prompt' });
  });

  it('should render the modal when isOpen is true and display the interest prompt', async () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    
    // Wait for the modal to be rendered
    expect(await screen.findByText('Settings')).toBeInTheDocument();
    
    // Wait for the interest prompt to be displayed
    expect(await screen.findByDisplayValue('test prompt')).toBeInTheDocument();
  });

  it('should not render the modal when isOpen is false', () => {
    render(<SettingsModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('should call onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    render(<SettingsModal isOpen={true} onClose={onClose} />);
    
    // Wait for the close button to be rendered and click it
    const closeButton = await screen.findByLabelText('Close');
    closeButton.click();
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
