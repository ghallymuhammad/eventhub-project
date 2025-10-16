import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationDialog, useConfirmationDialog } from '../ConfirmationDialog';

// Test component that uses the hook
function TestComponent() {
  const { showConfirmation, confirmDelete, ConfirmationDialog } = useConfirmationDialog();
  
  const handleDelete = jest.fn();
  const handleConfirm = jest.fn();

  return (
    <div>
      <button
        data-testid="show-confirmation"
        onClick={() => showConfirmation({
          title: 'Test Title',
          message: 'Test Message',
          onConfirm: handleConfirm,
        })}
      >
        Show Confirmation
      </button>
      
      <button
        data-testid="confirm-delete"
        onClick={() => confirmDelete('Test Item', handleDelete)}
      >
        Delete Item
      </button>
      
      <ConfirmationDialog />
    </div>
  );
}

describe('ConfirmationDialog', () => {
  it('should render confirmation dialog when open', () => {
    const mockConfirm = jest.fn();
    const mockClose = jest.fn();
    
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockClose}
        onConfirm={mockConfirm}
        title="Test Title"
        message="Test Message"
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const mockConfirm = jest.fn();
    const mockClose = jest.fn();
    
    render(
      <ConfirmationDialog
        isOpen={false}
        onClose={mockClose}
        onConfirm={mockConfirm}
        title="Test Title"
        message="Test Message"
      />
    );
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const mockConfirm = jest.fn();
    const mockClose = jest.fn();
    
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockClose}
        onConfirm={mockConfirm}
        title="Test Title"
        message="Test Message"
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);
    
    expect(mockConfirm).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockConfirm = jest.fn();
    const mockClose = jest.fn();
    
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockClose}
        onConfirm={mockConfirm}
        title="Test Title"
        message="Test Message"
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockClose).toHaveBeenCalled();
  });

  it('should show different styles for different types', () => {
    const mockConfirm = jest.fn();
    const mockClose = jest.fn();
    
    const { rerender } = render(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockClose}
        onConfirm={mockConfirm}
        title="Danger"
        message="Test Message"
        type="danger"
      />
    );
    
    expect(screen.getByText('Danger')).toBeInTheDocument();
    
    rerender(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockClose}
        onConfirm={mockConfirm}
        title="Warning"
        message="Test Message"
        type="warning"
      />
    );
    
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});

describe('useConfirmationDialog Hook', () => {
  it('should show confirmation dialog when showConfirmation is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const showButton = screen.getByTestId('show-confirmation');
    await user.click(showButton);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should show delete confirmation with proper message', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const deleteButton = screen.getByTestId('confirm-delete');
    await user.click(deleteButton);
    
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "Test Item"/)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should handle loading state properly', async () => {
    const user = userEvent.setup();
    const slowConfirm = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={jest.fn()}
        onConfirm={slowConfirm}
        title="Test"
        message="Test"
      />
    );
    
    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);
    
    // Should show loading state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });
});
