import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ContactForm } from '../ContactForm';

// Mock modules with jest.fn() directly in the mock
jest.mock('@/lib/validation', () => ({
  validateContactForm: jest.fn(() => ({})),
  formatFormDataForSubmission: jest.fn(data => data),
  RateLimiter: jest.fn().mockImplementation(() => ({
    isAllowed: jest.fn(() => true),
    getRemainingTime: jest.fn(() => 0),
  })),
}));

jest.mock('@/lib/emailjs', () => ({
  submitContactForm: jest.fn(() =>
    Promise.resolve({
      success: true,
      service: 'emailjs',
      message: 'Email sent successfully',
      timestamp: Date.now(),
    })
  ),
}));

jest.mock('@/lib/analytics', () => ({
  trackFormSubmission: jest.fn(),
  trackConversion: jest.fn(),
}));

// Store mock with state that can be modified
const mockStoreImplementation = {
  isSubmitting: false,
  submitStatus: 'idle' as 'idle' | 'submitting' | 'success' | 'error',
  errorMessage: null as string | null,
  setStatus: jest.fn(),
  resetForm: jest.fn(),
};

jest.mock('@/lib/store', () => ({
  useFormStore: () => mockStoreImplementation,
}));

// Get mock instances for easier testing
const mockValidation = require('@/lib/validation');
const mockEmailjs = require('@/lib/emailjs');

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store state to default
    mockStoreImplementation.isSubmitting = false;
    mockStoreImplementation.submitStatus = 'idle';
    mockStoreImplementation.errorMessage = null;

    // Reset validation mock to return no errors
    mockValidation.validateContactForm.mockReturnValue({});
  });

  it('renders all form fields', () => {
    render(<ContactForm />);

    // Check for required fields
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project timeline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project details/i)).toBeInTheDocument();

    // Check for optional fields
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/how did you hear about us/i)).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  it('shows validation errors for empty required fields', async () => {
    mockValidation.validateContactForm.mockReturnValue({
      name: 'Name is required',
      email: 'Email is required',
      message: 'Message is required',
    });

    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    render(<ContactForm />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/project details/i), {
      target: { value: 'I need help with cloud architecture' },
    });

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockEmailjs.submitContactForm).toHaveBeenCalled();
        expect(mockStoreImplementation.setStatus).toHaveBeenCalledWith('submitting');
      },
      { timeout: 3000 }
    );
  });

  it('resets form when reset button is clicked', () => {
    render(<ContactForm />);

    // Fill in some fields
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput.value).toBe('John Doe');

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset form/i });
    fireEvent.click(resetButton);

    // Form should be reset
    expect(nameInput.value).toBe('');
  });

  it('displays success message after successful submission', async () => {
    // Update mock store state to success
    mockStoreImplementation.submitStatus = 'success';
    mockStoreImplementation.errorMessage = 'Thank you! Your message has been sent successfully.' as string;

    render(<ContactForm />);

    expect(
      screen.getByText(/thank you! your message has been sent successfully/i)
    ).toBeInTheDocument();
  });

  it('displays error message after failed submission', async () => {
    // Update mock store state to error
    mockStoreImplementation.submitStatus = 'error';
    mockStoreImplementation.errorMessage = 'An error occurred. Please try again.' as string;

    render(<ContactForm />);

    expect(screen.getByText(/an error occurred. please try again/i)).toBeInTheDocument();
  });

  it('includes honeypot field for spam protection', () => {
    render(<ContactForm />);

    // The honeypot field should be present but hidden
    const honeypotField = screen.getByLabelText(/website \(leave blank\)/i);
    expect(honeypotField).toBeInTheDocument();
    expect(honeypotField.closest('div')).toHaveClass('hidden');
  });

  it('includes Netlify form attributes', () => {
    render(<ContactForm />);

    const form = screen.getByRole('form', { hidden: true });
    expect(form).toHaveAttribute('name', 'contact');
    expect(form).toHaveAttribute('method', 'POST');
    expect(form).toHaveAttribute('data-netlify', 'true');
  });
});

describe('ContactForm Accessibility', () => {
  it('has proper labels for all form fields', () => {
    render(<ContactForm />);

    // Check that all inputs have associated labels
    const inputs = screen.getAllByRole('textbox');
    const selects = screen.getAllByRole('combobox');

    [...inputs, ...selects].forEach(element => {
      expect(element).toHaveAccessibleName();
    });
  });

  it('shows required field indicators', () => {
    render(<ContactForm />);

    // Required fields should have asterisks - using more flexible regex
    expect(screen.getByText(/Full Name \*/)).toBeInTheDocument();
    expect(screen.getByText(/Email Address \*/)).toBeInTheDocument();
    expect(screen.getByText(/Project Type \*/)).toBeInTheDocument();
    expect(screen.getByText(/Project Timeline \*/)).toBeInTheDocument();
    expect(screen.getByText(/Project Details \*/)).toBeInTheDocument();
  });

  it('provides helpful error messages', async () => {
    mockValidation.validateContactForm.mockReturnValue({
      email: 'Please enter a valid email address',
    });

    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });
});
