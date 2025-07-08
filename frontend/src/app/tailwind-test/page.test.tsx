import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TailwindTestPage from './page';

// Mock the child components
jest.mock('@/components/TailwindTest', () => {
  return function MockTailwindTest() {
    return <div data-testid="mock-tailwind-test">Tailwind Test Component</div>;
  };
});

jest.mock('@/components/TailwindVerifier', () => {
  return function MockTailwindVerifier() {
    return <div data-testid="mock-tailwind-verifier">Tailwind Verifier Component</div>;
  };
});

describe('TailwindTestPage', () => {
  it('renders the page with all expected elements', () => {
    render(<TailwindTestPage />);
    
    // Check for the title
    expect(screen.getByText('Tailwind CSS Test Page')).toBeInTheDocument();
    
    // Check for tab buttons
    expect(screen.getByText('Automated Test')).toBeInTheDocument();
    expect(screen.getByText('Visual Elements')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });
  
  it('shows the automated test tab by default', () => {
    render(<TailwindTestPage />);
    
    // Check that the automated test content is visible
    expect(screen.getByText('Automated Tailwind Test')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tailwind-verifier')).toBeInTheDocument();
    
    // Other tab contents should not be visible
    expect(screen.queryByText('Visual Elements')).not.toBeNull(); // The tab button is visible
    expect(screen.queryByText('Colors & Typography')).toBeNull(); // But the content is not
  });
  
  it('switches to visual elements tab when clicked', () => {
    render(<TailwindTestPage />);
    
    // Click the Visual Elements tab
    fireEvent.click(screen.getByText('Visual Elements'));
    
    // Check that the visual elements content is visible
    expect(screen.getByText('Colors & Typography')).toBeInTheDocument();
    expect(screen.getByText('Buttons')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tailwind-test')).toBeInTheDocument();
    
    // Automated test content should not be visible
    expect(screen.queryByText('Automated Tailwind Test')).toBeNull();
  });
  
  it('switches to configuration tab when clicked', () => {
    render(<TailwindTestPage />);
    
    // Click the Configuration tab
    fireEvent.click(screen.getByText('Configuration'));
    
    // Check that the configuration content is visible
    expect(screen.getByText('Configuration Analysis')).toBeInTheDocument();
    expect(screen.getByText('Package Versions')).toBeInTheDocument();
    expect(screen.getByText('PostCSS Configuration')).toBeInTheDocument();
    expect(screen.getByText('Tailwind Configuration')).toBeInTheDocument();
    expect(screen.getByText('CSS Imports')).toBeInTheDocument();
    expect(screen.getByText('Troubleshooting Tips')).toBeInTheDocument();
    
    // Automated test content should not be visible
    expect(screen.queryByText('Automated Tailwind Test')).toBeNull();
  });
  
  it('has the active tab styled differently', () => {
    render(<TailwindTestPage />);
    
    // Initially, the Automated Test tab should be active
    const automatedTestTab = screen.getByText('Automated Test');
    expect(automatedTestTab).toHaveClass('border-blue-500');
    
    // The other tabs should not have the active class
    const visualElementsTab = screen.getByText('Visual Elements');
    const configurationTab = screen.getByText('Configuration');
    expect(visualElementsTab).not.toHaveClass('border-blue-500');
    expect(configurationTab).not.toHaveClass('border-blue-500');
    
    // After clicking Visual Elements, it should become active
    fireEvent.click(visualElementsTab);
    expect(visualElementsTab).toHaveClass('border-blue-500');
    expect(automatedTestTab).not.toHaveClass('border-blue-500');
    expect(configurationTab).not.toHaveClass('border-blue-500');
  });
  
  it('displays configuration information correctly', () => {
    render(<TailwindTestPage />);
    
    // Click the Configuration tab
    fireEvent.click(screen.getByText('Configuration'));
    
    // Check for configuration details
    expect(screen.getByText('Tailwind CSS:')).toBeInTheDocument();
    expect(screen.getByText('v4')).toBeInTheDocument();
    expect(screen.getByText('PostCSS:')).toBeInTheDocument();
    expect(screen.getByText('v8.4.38')).toBeInTheDocument();
    
    // Check for validation messages
    expect(screen.getByText('✓ Using correct plugin name "tailwindcss"')).toBeInTheDocument();
    expect(screen.getByText('✓ Autoprefixer is configured properly')).toBeInTheDocument();
    expect(screen.getByText('✓ Content paths include app components')).toBeInTheDocument();
    expect(screen.getByText('✓ Content paths include all necessary file extensions')).toBeInTheDocument();
    expect(screen.getByText('✓ All required Tailwind directives are present')).toBeInTheDocument();
  });
});