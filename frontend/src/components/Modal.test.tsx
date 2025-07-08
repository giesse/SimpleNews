import { fireEvent, screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from './Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset body style that might have been modified by previous tests
    document.body.style.overflow = '';
  });
  
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // The modal should not be in the document
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });
  
  it('renders modal content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // The modal should be in the document
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });
  
  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // Find the close button and click it
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('calls onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // Simulate pressing the Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClose when other keys are pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // Simulate pressing a different key
    fireEvent.keyDown(document, { key: 'Enter' });
    
    // onClose should not have been called
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('calls onClose when clicking outside the modal', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // Get the backdrop (the overlay behind the modal)
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    
    // Click on the backdrop (outside the modal content)
    if (backdrop) {
      fireEvent.mouseDown(backdrop);
    }
    
    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not call onClose when clicking inside the modal', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // Click inside the modal content
    fireEvent.mouseDown(screen.getByText('Modal content'));
    
    // onClose should not have been called
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('applies correct size class based on size prop', () => {
    // Test small size
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="small">
        <div>Modal content</div>
      </Modal>
    );
    
    expect(document.querySelector('.max-w-md')).toBeInTheDocument();
    
    // Test medium size (default)
    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    expect(document.querySelector('.max-w-2xl')).toBeInTheDocument();
    
    // Test large size
    rerender(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal" size="large">
        <div>Modal content</div>
      </Modal>
    );
    
    expect(document.querySelector('.max-w-4xl')).toBeInTheDocument();
  });
  
  it('has correct accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // Check for correct ARIA attributes
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    
    // Check that the title is properly linked
    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });
  
  it('prevents body scrolling when modal is open', () => {
    // Before rendering the modal
    expect(document.body.style.overflow).toBe('');
    
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // After rendering with isOpen=true
    expect(document.body.style.overflow).toBe('hidden');
    
    // After unmounting
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
  
  it('restores body scrolling when modal is closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // With modal open
    expect(document.body.style.overflow).toBe('hidden');
    
    // After closing the modal
    rerender(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    expect(document.body.style.overflow).toBe('');
  });
  
  it('removes event listeners when unmounted', () => {
    // Spy on addEventListener and removeEventListener
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );
    
    // On mount, addEventListener should be called for keydown and mousedown
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    // Store the number of calls before unmounting
    const addEventCount = addEventListenerSpy.mock.calls.length;
    
    // Unmount the component
    unmount();
    
    // On unmount, removeEventListener should be called for each event listener added
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThanOrEqual(addEventCount);
    
    // Clean up spies
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});