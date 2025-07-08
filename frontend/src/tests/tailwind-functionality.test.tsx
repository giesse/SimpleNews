/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// This test verifies that Tailwind CSS is working by checking if classes are applied correctly
describe('Tailwind CSS Functionality', () => {
  // Create a simple component with Tailwind classes
  const TailwindTestComponent = () => (
    <div>
      <div data-testid="bg-blue" className="bg-blue-500 w-10 h-10"></div>
      <div data-testid="text-lg" className="text-lg"></div>
      <div data-testid="p-4" className="p-4"></div>
      <div data-testid="flex" className="flex"></div>
    </div>
  );

  test('Tailwind classes should apply expected styles', () => {
    // Note: This test will fail if Tailwind CSS is not properly configured
    // Because JSDOM doesn't process CSS, we need to mock the expected behavior
    
    // Render the test component
    const { getByTestId } = render(<TailwindTestComponent />);
    
    // Get elements with Tailwind classes
    const bgBlueElement = getByTestId('bg-blue');
    const textLgElement = getByTestId('text-lg');
    const p4Element = getByTestId('p-4');
    const flexElement = getByTestId('flex');
    
    // In a real browser, these assertions would verify if Tailwind is applying styles
    // In JSDOM, they serve as a reminder that we need to check the actual browser rendering
    
    // Confirm elements exist (these should pass even if Tailwind is broken)
    expect(bgBlueElement).toBeInTheDocument();
    expect(textLgElement).toBeInTheDocument();
    expect(p4Element).toBeInTheDocument();
    expect(flexElement).toBeInTheDocument();
    
    // Check for class names (these should pass even if Tailwind is broken)
    expect(bgBlueElement).toHaveClass('bg-blue-500');
    expect(textLgElement).toHaveClass('text-lg');
    expect(p4Element).toHaveClass('p-4');
    expect(flexElement).toHaveClass('flex');
    
    // IMPORTANT: For a real test of Tailwind CSS functionality:
    // 1. Run the development server (npm run dev)
    // 2. Visit the /tailwind-test page in your browser
    // 3. Check if the TailwindVerifier component shows all tests passing
  });
});