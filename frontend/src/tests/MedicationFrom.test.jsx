import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import MedicationForm from '../components/Medications/MedicationForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('MedicationForm', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders add medication form', () => {
    renderWithProviders(<MedicationForm onClose={mockOnClose} />);
    
    expect(screen.getByText('Add New Medication')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Aspirin, Metformin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., 50mg, 1 tablet')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    renderWithProviders(<MedicationForm onClose={mockOnClose} />);
    
    const submitButton = screen.getByText('Add Medication');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Medication name is required')).toBeInTheDocument();
      expect(screen.getByText('Dosage is required')).toBeInTheDocument();
      expect(screen.getByText('Frequency is required')).toBeInTheDocument();
    });
  });

  it('renders edit form when medication is provided', () => {
    const medication = {
      id: 1,
      name: 'Test Medication',
      dosage: '50mg',
      frequency: 'Once daily',
      instructions: 'Take with food',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    };

    renderWithProviders(<MedicationForm medication={medication} onClose={mockOnClose} />);
    
    expect(screen.getByText('Edit Medication')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Medication')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50mg')).toBeInTheDocument();
  });
});