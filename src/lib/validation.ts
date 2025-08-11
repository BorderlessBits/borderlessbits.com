import DOMPurify from 'isomorphic-dompurify';
import type { ContactFormData, FormErrors } from '@/types';

// Security patterns to detect potential XSS/injection attacks
const SUSPICIOUS_PATTERNS = [
  /<script[^>]*>/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:text\/html/i,
  /vbscript:/i,
  /<iframe[^>]*>/i,
  /<object[^>]*>/i,
  /<embed[^>]*>/i,
  /<form[^>]*>/i,
  /<input[^>]*>/i,
];

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Name validation regex (letters, spaces, hyphens, apostrophes, and some international characters)
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/;

// Phone validation regex (international formats)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

/**
 * Sanitizes input string to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // First pass: DOMPurify to remove HTML tags
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Second pass: Additional sanitization
  return cleaned
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 2000); // Enforce max length
}

/**
 * Validates individual form fields
 */
export function validateField(field: string, value: string): string | null {
  const sanitizedValue = sanitizeInput(value);

  // Check for suspicious patterns
  const hasSuspiciousContent = SUSPICIOUS_PATTERNS.some(pattern => pattern.test(sanitizedValue));

  if (hasSuspiciousContent) {
    return 'Invalid characters detected. Please remove any HTML or script content.';
  }

  switch (field) {
    case 'name':
      if (!sanitizedValue) {
        return 'Name is required';
      }
      if (sanitizedValue.length < 2) {
        return 'Name must be at least 2 characters long';
      }
      if (sanitizedValue.length > 100) {
        return 'Name must be less than 100 characters';
      }
      if (!NAME_REGEX.test(sanitizedValue)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      break;

    case 'email':
      if (!sanitizedValue) {
        return 'Email is required';
      }
      if (!EMAIL_REGEX.test(sanitizedValue)) {
        return 'Please enter a valid email address';
      }
      if (sanitizedValue.length > 254) {
        return 'Email address is too long';
      }
      break;

    case 'company':
      if (sanitizedValue && sanitizedValue.length > 200) {
        return 'Company name must be less than 200 characters';
      }
      break;

    case 'message':
      if (!sanitizedValue) {
        return 'Message is required';
      }
      if (sanitizedValue.length < 10) {
        return 'Message must be at least 10 characters long';
      }
      if (sanitizedValue.length > 2000) {
        return 'Message must be less than 2000 characters';
      }
      break;

    case 'phone':
      if (sanitizedValue && !PHONE_REGEX.test(sanitizedValue)) {
        return 'Please enter a valid phone number';
      }
      break;

    default:
      break;
  }

  return null;
}

/**
 * Validates the complete contact form
 */
export function validateContactForm(data: ContactFormData): FormErrors {
  const errors: FormErrors = {};

  // Required field validation
  const nameError = validateField('name', data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateField('email', data.email);
  if (emailError) errors.email = emailError;

  const messageError = validateField('message', data.message);
  if (messageError) errors.message = messageError;

  // Optional field validation
  if (data.company) {
    const companyError = validateField('company', data.company);
    if (companyError) errors.company = companyError;
  }

  // Enum validation
  const validProjectTypes = [
    'cloud_architecture',
    'healthcare_software',
    'enterprise_consulting',
    'other',
  ];
  if (!validProjectTypes.includes(data.project_type)) {
    errors.project_type = 'Please select a valid project type';
  }

  const validTimelines = ['immediate', 'within_3_months', 'within_6_months', 'planning_phase'];
  if (!validTimelines.includes(data.project_timeline)) {
    errors.project_timeline = 'Please select a valid timeline';
  }

  if (data.budget_range) {
    const validBudgetRanges = ['under_25k', 'from_25k_to_50k', 'from_50k_to_100k', 'over_100k'];
    if (!validBudgetRanges.includes(data.budget_range)) {
      errors.budget_range = 'Please select a valid budget range';
    }
  }

  if (data.referral_source) {
    const validReferralSources = ['google_search', 'linkedin', 'referral', 'other'];
    if (!validReferralSources.includes(data.referral_source)) {
      errors.referral_source = 'Please select a valid referral source';
    }
  }

  return errors;
}

/**
 * Checks if the form submission appears to be spam
 */
export function isLikelySpam(data: ContactFormData): boolean {
  const spamIndicators = [
    // Check for excessive links in message
    (data.message.match(/https?:\/\//g) || []).length > 2,

    // Check for repeated characters
    /(.)\1{10,}/.test(data.message),

    // Check for common spam phrases
    /\b(buy now|click here|free money|guaranteed|limited time|act now)\b/i.test(data.message),

    // Check for excessive caps
    data.message.replace(/[^A-Z]/g, '').length > data.message.length * 0.5,

    // Check for suspicious email patterns
    /\d{5,}@/.test(data.email) || /noreply|no-reply/i.test(data.email),

    // Check for very short or generic names
    data.name.length < 2 || /^(test|user|admin|name)$/i.test(data.name),
  ];

  // Consider spam if 2 or more indicators are present
  return spamIndicators.filter(Boolean).length >= 2;
}

/**
 * Rate limiting helper (client-side backup)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 5 * 60 * 1000 // 5 minutes
  ): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    // Remove attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    return true;
  }

  getRemainingTime(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 5 * 60 * 1000
  ): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length < maxAttempts) {
      return 0;
    }

    const oldestAttempt = attempts[0];
    const timeRemaining = windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, timeRemaining);
  }
}

/**
 * Validates email address format more strictly
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic format check
  if (!EMAIL_REGEX.test(email)) {
    return false;
  }

  // Additional checks
  const [localPart, domain] = email.split('@');

  // Check local part
  if (!localPart || localPart.length > 64) {
    return false;
  }

  // Check domain
  if (!domain || domain.length > 253) {
    return false;
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return false;
  }

  // Check for valid domain format
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return false;
  }

  // Check each domain part
  for (const part of domainParts) {
    if (!part || part.length > 63 || !/^[a-zA-Z0-9-]+$/.test(part)) {
      return false;
    }
    if (part.startsWith('-') || part.endsWith('-')) {
      return false;
    }
  }

  return true;
}

/**
 * Formats form data for safe transmission
 */
export function formatFormDataForSubmission(data: ContactFormData): ContactFormData {
  return {
    name: sanitizeInput(data.name),
    email: sanitizeInput(data.email).toLowerCase(),
    company: data.company ? sanitizeInput(data.company) : undefined,
    project_type: data.project_type,
    project_timeline: data.project_timeline,
    message: sanitizeInput(data.message),
    budget_range: data.budget_range,
    referral_source: data.referral_source,
  };
}

/**
 * Generates a simple honeypot field value for spam detection
 */
export function generateHoneypot(): string {
  // Generate a random string that looks like a field name but should be left empty
  const honeypotNames = ['website', 'url', 'homepage', 'fax', 'address2'];
  return honeypotNames[Math.floor(Math.random() * honeypotNames.length)];
}
