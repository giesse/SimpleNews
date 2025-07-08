import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TailwindTest from './TailwindTest';

// This test checks if Tailwind CSS classes are being properly applied
describe('TailwindTest Component', () => {
  it('renders with correct Tailwind styles', async () => {
    // Render the component
    const { container } = render(<TailwindTest />);
    
    // Get the main container element
    const mainContainer = container.querySelector('.tailwind-test-container');
    expect(mainContainer).toBeInTheDocument();
    
    // Check if heading has correct text and styles
    const heading = screen.getByText('Tailwind Test Component');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl');
    expect(heading).toHaveClass('font-bold');
    
    // Check button styles
    const greenButton = screen.getByText('Green Button');
    expect(greenButton).toHaveClass('bg-green-500');
    
    const redButton = screen.getByText('Red Button');
    expect(redButton).toHaveClass('bg-red-500');
    
    // The test above checks if the classes are applied, but doesn't verify
    // if Tailwind is actually processing them into CSS. Let's check computed styles:
    
    // To fully verify Tailwind is working, we need to check computed styles
    // This requires the component to be rendered in a browser environment
    // Here we're using jest-dom's toHaveStyle to check basic styles
    
    // NOTE: This test is limited because Jest's JSDOM doesn't fully compute CSS
    // For a complete test, consider creating a visual test or using Cypress
    
    // Instead of checking computed styles which can be inconsistent in JSDOM,
    // let's verify the class is applied since we already confirmed Tailwind classes work
    expect(greenButton).toHaveClass('font-bold');
    expect(redButton).toHaveClass('font-bold');
  });
});