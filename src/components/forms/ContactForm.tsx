'use client';

import { useState, useCallback, useRef } from 'react';
import { submitContactForm } from '@/lib/emailjs';
import { validateContactForm, formatFormDataForSubmission, RateLimiter } from '@/lib/validation';
import { trackFormSubmission, trackConversion } from '@/lib/analytics';
import { useFormStore } from '@/lib/store';
import type { ContactFormData, FormErrors } from '@/types';

// Rate limiter instance
const rateLimiter = new RateLimiter();

// Initial form data
const initialFormData: ContactFormData = {
  name: '',
  email: '',
  company: '',
  project_type: 'cloud_architecture',
  project_timeline: 'planning_phase',
  message: '',
  budget_range: undefined,
  referral_source: undefined,
};

export function ContactForm() {
  // State management
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [honeypotField, setHoneypotField] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  
  // Global form state
  const { isSubmitting, submitStatus, errorMessage, setStatus, resetForm } = useFormStore();

  /**
   * Handle input changes with validation
   */
  const handleChange = useCallback((
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  /**
   * Handle form submission with dual processing
   */
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Honeypot spam detection
    if (honeypotField) {
      console.warn('Spam detected via honeypot');
      return;
    }

    // Rate limiting check (client-side backup)
    const clientIP = 'client'; // Simplified identifier
    if (!rateLimiter.isAllowed(clientIP)) {
      const remainingTime = rateLimiter.getRemainingTime(clientIP);
      setStatus('error', `Too many attempts. Please wait ${Math.ceil(remainingTime / 1000 / 60)} minutes.`);
      return;
    }

    // Set submitting state
    setStatus('submitting');
    
    try {
      // Validate form data
      const sanitizedData = formatFormDataForSubmission(formData);
      const validationErrors = validateContactForm(sanitizedData);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setStatus('error', 'Please fix the errors above');
        return;
      }

      // Track form submission attempt
      trackFormSubmission('contact_form', false);

      console.log('Submitting contact form...', sanitizedData);

      // Submit form using dual processing strategy
      const result = await submitContactForm(sanitizedData);
      
      if (result.success) {
        console.log('Form submission successful:', result);
        
        // Track successful conversion
        trackFormSubmission('contact_form', true);
        trackConversion('contact_form', sanitizedData.project_type);
        
        // Reset form and show success
        setFormData(initialFormData);
        setErrors({});
        setStatus('success', 'Thank you! Your message has been sent successfully.');
        
        // Scroll to top of form to show success message
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
      } else {
        console.error('Form submission failed:', result);
        trackFormSubmission('contact_form', false, result.message);
        setStatus('error', result.message);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      
      trackFormSubmission('contact_form', false, errorMessage);
      setStatus('error', errorMessage);
    }
  }, [formData, honeypotField, setStatus]);

  /**
   * Reset form to initial state
   */
  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    resetForm();
  }, [resetForm]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
        // Netlify Forms attributes (for Netlify hosting)
        name="contact"
        method="POST"
        data-netlify="true"
        data-netlify-recaptcha="true"
      >
        {/* Hidden field for Netlify Forms */}
        <input type="hidden" name="form-name" value="contact" />
        
        {/* Honeypot field for spam detection */}
        <div className="hidden">
          <label htmlFor="website">Website (leave blank):</label>
          <input
            type="text"
            name="website"
            id="website"
            value={honeypotField}
            onChange={(e) => setHoneypotField(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="p-4 rounded-lg bg-success-50 border border-success-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-success-800">
                  {errorMessage || 'Thank you! Your message has been sent successfully.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 rounded-lg bg-error-50 border border-error-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-error-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-error-800">
                  {errorMessage || 'An error occurred. Please try again.'}
                </p>
                <p className="text-xs text-error-600 mt-1">
                  If the problem persists, please email directly at{' '}
                  <a href="mailto:richard@borderlessbits.com" className="underline">
                    richard@borderlessbits.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`form-input ${errors.name ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Enter your full name"
            required
            disabled={isSubmitting}
            autoComplete="name"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`form-input ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="your.email@company.com"
            required
            disabled={isSubmitting}
            autoComplete="email"
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        {/* Company Field */}
        <div>
          <label htmlFor="company" className="form-label">
            Company Name
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={`form-input ${errors.company ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Your company name"
            disabled={isSubmitting}
            autoComplete="organization"
          />
          {errors.company && <p className="form-error">{errors.company}</p>}
        </div>

        {/* Project Type Field */}
        <div>
          <label htmlFor="project_type" className="form-label">
            Project Type *
          </label>
          <select
            id="project_type"
            name="project-type"
            value={formData.project_type}
            onChange={(e) => handleChange('project_type', e.target.value)}
            className={`form-select ${errors.project_type ? 'border-error-500 focus:ring-error-500' : ''}`}
            required
            disabled={isSubmitting}
          >
            <option value="cloud_architecture">Cloud Architecture</option>
            <option value="healthcare_software">Healthcare Software</option>
            <option value="enterprise_consulting">Enterprise Consulting</option>
            <option value="other">Other</option>
          </select>
          {errors.project_type && <p className="form-error">{errors.project_type}</p>}
        </div>

        {/* Timeline Field */}
        <div>
          <label htmlFor="project_timeline" className="form-label">
            Project Timeline *
          </label>
          <select
            id="project_timeline"
            name="project-timeline"
            value={formData.project_timeline}
            onChange={(e) => handleChange('project_timeline', e.target.value)}
            className={`form-select ${errors.project_timeline ? 'border-error-500 focus:ring-error-500' : ''}`}
            required
            disabled={isSubmitting}
          >
            <option value="immediate">Immediate (within 1 month)</option>
            <option value="within_3_months">Within 3 months</option>
            <option value="within_6_months">Within 6 months</option>
            <option value="planning_phase">Planning phase</option>
          </select>
          {errors.project_timeline && <p className="form-error">{errors.project_timeline}</p>}
        </div>

        {/* Budget Range Field */}
        <div>
          <label htmlFor="budget_range" className="form-label">
            Budget Range (Optional)
          </label>
          <select
            id="budget_range"
            name="budget-range"
            value={formData.budget_range || ''}
            onChange={(e) => handleChange('budget_range', e.target.value)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="">Select budget range (optional)</option>
            <option value="under_25k">Under $25,000</option>
            <option value="from_25k_to_50k">$25,000 - $50,000</option>
            <option value="from_50k_to_100k">$50,000 - $100,000</option>
            <option value="over_100k">Over $100,000</option>
          </select>
        </div>

        {/* Referral Source Field */}
        <div>
          <label htmlFor="referral_source" className="form-label">
            How did you hear about us? (Optional)
          </label>
          <select
            id="referral_source"
            name="referral-source"
            value={formData.referral_source || ''}
            onChange={(e) => handleChange('referral_source', e.target.value)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="">Select source (optional)</option>
            <option value="google_search">Google Search</option>
            <option value="linkedin">LinkedIn</option>
            <option value="referral">Referral</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="form-label">
            Project Details *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className={`form-textarea ${errors.message ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Please describe your project requirements, challenges, and goals. The more details you provide, the better we can assist you."
            required
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message && <p className="form-error">{errors.message}</p>}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.message.length}/2000 characters
            </p>
          </div>
        </div>

        {/* reCAPTCHA placeholder (Netlify will inject this) */}
        <div data-netlify-recaptcha="true"></div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost"
            disabled={isSubmitting}
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary btn-lg min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner mr-2" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p>
            Your privacy is important to us. This form is secured with spam protection and your 
            information will only be used to respond to your inquiry. We never share your data 
            with third parties.
          </p>
        </div>
      </form>
    </div>
  );
}