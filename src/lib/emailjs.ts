import emailjs from '@emailjs/browser';
import type { ContactFormData, EmailSubmissionResult } from '@/types';
import { formatFormDataForSubmission, isLikelySpam } from './validation';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
} as const;

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
} as const;

/**
 * Sleep helper for retry logic
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

/**
 * Validates EmailJS configuration
 */
export function validateEmailJSConfig(): boolean {
  return !!(
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.publicKey
  );
}

/**
 * Sends contact email via EmailJS with retry logic
 */
export async function sendContactEmail(
  formData: ContactFormData,
  retryAttempt: number = 1
): Promise<EmailSubmissionResult> {
  const startTime = Date.now();

  try {
    // Validate configuration
    if (!validateEmailJSConfig()) {
      throw new Error('EmailJS configuration is incomplete');
    }

    // Format and validate data
    const sanitizedData = formatFormDataForSubmission(formData);

    // Basic spam detection (client-side)
    if (isLikelySpam(sanitizedData)) {
      return {
        success: false,
        service: 'emailjs',
        message: 'Submission rejected due to spam detection',
        timestamp: Date.now(),
      };
    }

    // Prepare template parameters
    const templateParams = {
      from_name: sanitizedData.name,
      from_email: sanitizedData.email,
      company: sanitizedData.company || 'Not provided',
      project_type: formatProjectType(sanitizedData.project_type),
      project_timeline: formatProjectTimeline(sanitizedData.project_timeline),
      message: sanitizedData.message,
      budget_range: sanitizedData.budget_range 
        ? formatBudgetRange(sanitizedData.budget_range)
        : 'Not provided',
      referral_source: sanitizedData.referral_source
        ? formatReferralSource(sanitizedData.referral_source)
        : 'Not provided',
      to_email: 'richard@borderlessbits.com',
      submission_date: new Date().toLocaleString(),
      client_ip: 'Hidden for privacy',
    };

    console.log('Sending email via EmailJS...', {
      service: EMAILJS_CONFIG.serviceId,
      template: EMAILJS_CONFIG.templateId,
      attempt: retryAttempt,
    });

    // Send email via EmailJS
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('EmailJS success:', result);

    // Send auto-reply to customer
    await sendAutoReply(sanitizedData).catch(error => {
      console.warn('Auto-reply failed:', error);
      // Don't fail the main submission if auto-reply fails
    });

    return {
      success: true,
      service: 'emailjs',
      message: 'Email sent successfully',
      timestamp: Date.now(),
    };

  } catch (error: any) {
    console.error(`EmailJS attempt ${retryAttempt} failed:`, error);

    // Retry logic
    if (retryAttempt < RETRY_CONFIG.maxAttempts) {
      const delay = getRetryDelay(retryAttempt);
      console.log(`Retrying in ${delay}ms...`);
      
      await sleep(delay);
      return sendContactEmail(formData, retryAttempt + 1);
    }

    // All retries exhausted
    return {
      success: false,
      service: 'emailjs',
      message: getErrorMessage(error),
      timestamp: Date.now(),
    };
  }
}

/**
 * Sends auto-reply confirmation email to customer
 */
async function sendAutoReply(formData: ContactFormData): Promise<void> {
  const autoReplyTemplateId = process.env.NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID;
  
  if (!autoReplyTemplateId) {
    console.log('Auto-reply template not configured, skipping...');
    return;
  }

  const templateParams = {
    to_email: formData.email,
    to_name: formData.name,
    project_type: formatProjectType(formData.project_type),
    from_name: 'Richard Mosley',
    from_email: 'richard@borderlessbits.com',
    company_name: 'BorderlessBits',
    submission_date: new Date().toLocaleString(),
  };

  await emailjs.send(
    EMAILJS_CONFIG.serviceId,
    autoReplyTemplateId,
    templateParams,
    EMAILJS_CONFIG.publicKey
  );

  console.log('Auto-reply sent successfully');
}

/**
 * Submits form via Netlify Forms (primary method)
 */
export async function submitNetlifyForm(
  formData: ContactFormData
): Promise<EmailSubmissionResult> {
  const startTime = Date.now();

  try {
    const sanitizedData = formatFormDataForSubmission(formData);

    // Basic spam detection
    if (isLikelySpam(sanitizedData)) {
      return {
        success: false,
        service: 'netlify',
        message: 'Submission rejected due to spam detection',
        timestamp: Date.now(),
      };
    }

    // Prepare form data for Netlify
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('form-name', 'contact');
    formDataToSubmit.append('name', sanitizedData.name);
    formDataToSubmit.append('email', sanitizedData.email);
    if (sanitizedData.company) {
      formDataToSubmit.append('company', sanitizedData.company);
    }
    formDataToSubmit.append('project-type', sanitizedData.project_type);
    formDataToSubmit.append('project-timeline', sanitizedData.project_timeline);
    formDataToSubmit.append('message', sanitizedData.message);
    if (sanitizedData.budget_range) {
      formDataToSubmit.append('budget-range', sanitizedData.budget_range);
    }
    if (sanitizedData.referral_source) {
      formDataToSubmit.append('referral-source', sanitizedData.referral_source);
    }

    console.log('Submitting to Netlify Forms...');

    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formDataToSubmit as any).toString(),
    });

    if (response.ok) {
      console.log('Netlify Forms submission successful');
      return {
        success: true,
        service: 'netlify',
        message: 'Form submitted successfully',
        timestamp: Date.now(),
      };
    } else {
      throw new Error(`Netlify Forms error: ${response.status} ${response.statusText}`);
    }

  } catch (error: any) {
    console.error('Netlify Forms submission failed:', error);
    return {
      success: false,
      service: 'netlify',
      message: getErrorMessage(error),
      timestamp: Date.now(),
    };
  }
}

/**
 * Dual submission strategy: Netlify Forms (primary) + EmailJS (fallback)
 */
export async function submitContactForm(
  formData: ContactFormData
): Promise<EmailSubmissionResult> {
  console.log('Starting dual form submission...');

  // Try Netlify Forms first (if on Netlify-hosted site)
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    const netlifyResult = await submitNetlifyForm(formData);
    if (netlifyResult.success) {
      return netlifyResult;
    }
    console.log('Netlify Forms failed, falling back to EmailJS...');
  }

  // Fallback to EmailJS
  const emailjsResult = await sendContactEmail(formData);
  
  // If both methods fail, provide a helpful error message
  if (!emailjsResult.success) {
    return {
      success: false,
      service: 'fallback',
      message: 'Unable to submit form. Please email directly at richard@borderlessbits.com',
      timestamp: Date.now(),
    };
  }

  return emailjsResult;
}

/**
 * Format enum values for human reading
 */
function formatProjectType(type: string): string {
  const types = {
    cloud_architecture: 'Cloud Architecture',
    healthcare_software: 'Healthcare Software',
    enterprise_consulting: 'Enterprise Consulting',
    other: 'Other',
  };
  return types[type as keyof typeof types] || type;
}

function formatProjectTimeline(timeline: string): string {
  const timelines = {
    immediate: 'Immediate (within 1 month)',
    within_3_months: 'Within 3 months',
    within_6_months: 'Within 6 months',
    planning_phase: 'Planning phase',
  };
  return timelines[timeline as keyof typeof timelines] || timeline;
}

function formatBudgetRange(budget: string): string {
  const budgets = {
    under_25k: 'Under $25,000',
    from_25k_to_50k: '$25,000 - $50,000',
    from_50k_to_100k: '$50,000 - $100,000',
    over_100k: 'Over $100,000',
  };
  return budgets[budget as keyof typeof budgets] || budget;
}

function formatReferralSource(source: string): string {
  const sources = {
    google_search: 'Google Search',
    linkedin: 'LinkedIn',
    referral: 'Referral',
    other: 'Other',
  };
  return sources[source as keyof typeof sources] || source;
}

/**
 * Extract user-friendly error message
 */
function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.text) {
    return error.text;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Test EmailJS configuration and connection
 */
export async function testEmailJSConnection(): Promise<boolean> {
  try {
    if (!validateEmailJSConfig()) {
      return false;
    }

    // Initialize EmailJS
    emailjs.init(EMAILJS_CONFIG.publicKey);
    
    // Test with minimal template parameters
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        from_name: 'Test',
        from_email: 'test@example.com',
        message: 'Connection test',
        to_email: 'richard@borderlessbits.com',
      },
      EMAILJS_CONFIG.publicKey
    );

    return result.status === 200;
  } catch (error) {
    console.error('EmailJS connection test failed:', error);
    return false;
  }
}