import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TailwindVerifier from './TailwindVerifier';

// Mock window.getComputedStyle
const originalGetComputedStyle = window.getComputedStyle;
const mockGetComputedStyle = jest.fn();

describe('TailwindVerifier', () => {
  beforeAll(() => {
    // Mock document.createElement to track created elements
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tagName) => {
      const element = originalCreateElement.call(document, tagName);
      // Add a spy to appendChild
      jest.spyOn(document.body, 'appendChild');
      jest.spyOn(document.body, 'removeChild');
      return element;
    });

    // Mock getComputedStyle to return expected values for Tailwind classes
    window.getComputedStyle = mockGetComputedStyle.mockImplementation((element) => {
      const className = element.className;
      const styles: Partial<CSSStyleDeclaration> = {};
      
      // Mock computed styles based on Tailwind classes
      if (className.includes('bg-blue-500')) {
        styles.backgroundColor = 'rgb(59, 130, 246)';
      } else if (className.includes('text-2xl')) {
        styles.fontSize = '1.5rem';
      } else if (className.includes('p-4')) {
        styles.padding = '1rem';
      } else if (className.includes('rounded-lg')) {
        styles.borderRadius = '0.5rem';
      } else if (className.includes('font-bold')) {
        styles.fontWeight = '700';
      } else if (className.includes('flex')) {
        styles.display = 'flex';
      } else if (className.includes('hidden')) {
        styles.display = 'none';
      }
      
      return {
        ...originalGetComputedStyle(element),
        ...styles,
        getPropertyValue: (prop: string) => {
          return (styles as Record<string, string>)[prop] || '';
        }
      } as CSSStyleDeclaration;
    });
  });

  afterAll(() => {
    // Restore original methods
    window.getComputedStyle = originalGetComputedStyle;
    jest.restoreAllMocks();
  });

  it('renders the component with title', () => {
    render(<TailwindVerifier />);
    
    expect(screen.getByText('Tailwind CSS Verification')).toBeInTheDocument();
  });

  it('creates test elements to verify Tailwind classes', () => {
    render(<TailwindVerifier />);
    
    // Verify that elements are created and then removed during testing
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });

  it('displays test results', () => {
    render(<TailwindVerifier />);
    
    // Check for results sections
    const passingTests = screen.getByText('Passing Tests:');
    expect(passingTests).toBeInTheDocument();
    
    // All tests should pass with our mocked getComputedStyle
    expect(screen.queryByText('Failed Tests:')).not.toBeInTheDocument();
    
    // Check for success percentage
    expect(screen.getByText('7/7 tests passing (100%)')).toBeInTheDocument();
    
    // Check for success message
    expect(screen.getByText('All tests passed!')).toBeInTheDocument();
  });

  it('displays appropriate colors for test status', () => {
    render(<TailwindVerifier />);
    
    // With all tests passing, we should see green styling
    const statusContainer = screen.getByText('All tests passed!').closest('div');
    expect(statusContainer?.parentElement).toHaveClass('bg-green-100');
    expect(statusContainer?.parentElement).toHaveClass('text-green-800');
  });

  it('displays help text about Tailwind verification', () => {
    render(<TailwindVerifier />);
    
    // Check for the explanatory text
    expect(screen.getByText('This test creates elements with Tailwind classes and checks if the expected CSS styles are applied.')).toBeInTheDocument();
    expect(screen.getByText('If tests are failing, it indicates that Tailwind is not properly processing your classes.')).toBeInTheDocument();
  });

  it('lists test results for individual Tailwind classes', () => {
    render(<TailwindVerifier />);
    
    // Since our mock is set up to pass all tests, we should see entries in the passing tests list
    const passingTestItems = screen.getAllByRole('listitem');
    expect(passingTestItems.length).toBeGreaterThan(0);
    
    // We should see results for specific Tailwind classes
    expect(screen.getByText(/bg-blue-500/)).toBeInTheDocument();
    expect(screen.getByText(/text-2xl/)).toBeInTheDocument();
    expect(screen.getByText(/font-bold/)).toBeInTheDocument();
  });
});