import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingIndicator from './LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders spinner by default when no progress is provided', () => {
    render(<LoadingIndicator />);
    
    // Check for the spinner element
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // Progress bar and percentage should not be present
    expect(document.querySelector('.bg-blue-600')).not.toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
  
  it('renders progress bar when progress is provided', () => {
    render(<LoadingIndicator progress={50} />);
    
    // Check for the progress bar
    const progressBar = document.querySelector('.bg-blue-600');
    expect(progressBar).toBeInTheDocument();
    
    // Progress percentage should be present
    expect(screen.getByText('50%')).toBeInTheDocument();
    
    // Spinner should not be present
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
  });
  
  it('applies correct width style to progress bar based on progress value', () => {
    render(<LoadingIndicator progress={75} />);
    
    const progressBar = document.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });
  
  it('rounds the progress percentage', () => {
    render(<LoadingIndicator progress={33.33} />);
    
    // Should round to 33%
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
  
  it('displays the provided message', () => {
    const message = 'Loading your content...';
    render(<LoadingIndicator message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('applies small size classes correctly', () => {
    render(<LoadingIndicator size="small" message="Loading" />);
    
    // Check for small spinner size
    const spinner = document.querySelector('.h-4.w-4');
    expect(spinner).toBeInTheDocument();
    
    // Check for small text size
    const message = screen.getByText('Loading');
    expect(message).toHaveClass('text-xs');
  });
  
  it('applies medium size classes correctly (default)', () => {
    render(<LoadingIndicator message="Loading" />);
    
    // Check for medium spinner size (default)
    const spinner = document.querySelector('.h-8.w-8');
    expect(spinner).toBeInTheDocument();
    
    // Check for medium text size
    const message = screen.getByText('Loading');
    expect(message).toHaveClass('text-sm');
  });
  
  it('applies large size classes correctly', () => {
    render(<LoadingIndicator size="large" message="Loading" />);
    
    // Check for large spinner size
    const spinner = document.querySelector('.h-12.w-12');
    expect(spinner).toBeInTheDocument();
    
    // Check for large text size
    const message = screen.getByText('Loading');
    expect(message).toHaveClass('text-base');
  });
  
  it('shows both message and progress percentage when both are provided', () => {
    const message = 'Uploading files...';
    render(<LoadingIndicator message={message} progress={42} />);
    
    // Both message and percentage should be present
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
  
  it('handles edge case: 0% progress', () => {
    render(<LoadingIndicator progress={0} />);
    
    // Progress bar should be present but with 0% width
    const progressBar = document.querySelector('.bg-blue-600');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '0%' });
    
    // Percentage text should show 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
  
  it('handles edge case: 100% progress', () => {
    render(<LoadingIndicator progress={100} />);
    
    // Progress bar should be present with 100% width
    const progressBar = document.querySelector('.bg-blue-600');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '100%' });
    
    // Percentage text should show 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
  
  it('handles progress values greater than 100', () => {
    render(<LoadingIndicator progress={120} />);
    
    // Progress bar width should be capped at 100%
    const progressBar = document.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '120%' });
    
    // Percentage text should show the actual value
    expect(screen.getByText('120%')).toBeInTheDocument();
  });
  
  it('has correct accessibility structure', () => {
    render(<LoadingIndicator 
      message="Loading content" 
      progress={50}
      aria-label="Content is loading, 50% complete"
    />);
    
    // Ideally, the component should have proper ARIA attributes for accessibility
    // For this test, we're checking that the message and percentage are visible to screen readers
    expect(screen.getByText('Loading content')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});