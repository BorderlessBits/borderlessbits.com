import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ContactForm } from '../ContactForm';

// Mock the validation and email modules
jest.mock('@/lib/validation', () => ({
  validateContactForm: jest.fn(() => ({})),
  formatFormDataForSubmission: jest.fn((data) => data),
  RateLimiter: jest.fn().mockImplementation(() => ({
    isAllowed: jest.fn(() => true),
    getRemainingTime: jest.fn(() => 0),
  })),
}));

jest.mock('@/lib/emailjs', () => ({
  submitContactForm: jest.fn(() => Promise.resolve({
    success: true,
    service: 'emailjs',
    message: 'Email sent successfully',
    timestamp: Date.now(),
  })),
}));

jest.mock('@/lib/analytics', () => ({
  trackFormSubmission: jest.fn(),
  trackConversion: jest.fn(),
}));

jest.mock('@/lib/store', () => ({
  useFormStore: () => ({
    isSubmitting: false,
    submitStatus: 'idle',
    errorMessage: null,
    setStatus: jest.fn(),
    resetForm: jest.fn(),
  }),
}));

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const { validateContactForm } = require('@/lib/validation');
    validateContactForm.mockReturnValue({
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
    const { submitContactForm } = require('@/lib/emailjs');
    
    render(<ContactForm />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/project details/i), { 
      target: { value: 'I need help with cloud architecture' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalled();
    });
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
    const mockStore = {
      isSubmitting: false,
      submitStatus: 'success',
      errorMessage: 'Thank you! Your message has been sent successfully.',
      setStatus: jest.fn(),
      resetForm: jest.fn(),
    };

    jest.doMock('@/lib/store', () => ({
      useFormStore: () => mockStore,
    }));

    render(<ContactForm />);
    
    expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
  });

  it('displays error message after failed submission', async () => {
    const mockStore = {
      isSubmitting: false,
      submitStatus: 'error',
      errorMessage: 'An error occurred. Please try again.',
      setStatus: jest.fn(),
      resetForm: jest.fn(),
    };

    jest.doMock('@/lib/store', () => ({
      useFormStore: () => mockStore,
    }));

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
    
    // Required fields should have asterisks
    expect(screen.getByText(/full name \*/)).toBeInTheDocument();
    expect(screen.getByText(/email address \*/)).toBeInTheDocument();
    expect(screen.getByText(/project type \*/)).toBeInTheDocument();
    expect(screen.getByText(/project timeline \*/)).toBeInTheDocument();
    expect(screen.getByText(/project details \*/)).toBeInTheDocument();
  });

  it('provides helpful error messages', async () => {
    const { validateContactForm } = require('@/lib/validation');
    validateContactForm.mockReturnValue({
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