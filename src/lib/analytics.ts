import type { AnalyticsEvent, WebVital } from '@/types';

// Google Analytics 4 configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

// Enhanced ecommerce and conversion tracking
interface ConversionEvent {
  event_name: string;
  event_category: string;
  event_label?: string;
  value?: number;
  currency?: string;
  custom_parameters?: Record<string, any>;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Analytics 4 with privacy controls
 */
export function initializeGA(): void {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics ID not found');
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  // Check for consent before initializing
  const hasConsent = getAnalyticsConsent();
  if (!hasConsent) {
    console.log('Analytics consent not granted, skipping GA initialization');
    return;
  }

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());

  // Configure GA with privacy settings
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    anonymize_ip: true,
    allow_ad_personalization_signals: false,
    allow_google_signals: false,
    cookie_expires: 63072000, // 2 years in seconds
    cookie_domain: 'auto',
    cookie_update: true,
    cookie_flags: 'SameSite=None;Secure', // For cross-site tracking compliance
  });

  console.log('Google Analytics initialized');
}

/**
 * Track page views
 */
export function trackPageView(url: string, title?: string): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_location: url,
    page_title: title || document.title,
  });

  console.log('Page view tracked:', { url, title });
}

/**
 * Track custom events
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
  });

  console.log('Event tracked:', event);
}

/**
 * Track form submissions and conversions
 */
export function trackFormSubmission(
  formType: string,
  success: boolean,
  errorMessage?: string
): void {
  if (!isAnalyticsEnabled()) return;

  const event: ConversionEvent = {
    event_name: 'form_submit',
    event_category: 'engagement',
    event_label: formType,
    value: success ? 1 : 0,
    custom_parameters: {
      form_type: formType,
      success,
      error_message: errorMessage || null,
      timestamp: Date.now(),
    },
  };

  window.gtag('event', event.event_name, {
    event_category: event.event_category,
    event_label: event.event_label,
    value: event.value,
    custom_parameters: event.custom_parameters,
  });

  // Track as conversion if successful
  if (success) {
    trackConversion('contact_form', formType);
  }

  console.log('Form submission tracked:', event);
}

/**
 * Track business conversions (leads)
 */
export function trackConversion(conversionType: string, conversionValue?: string): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'conversion', {
    send_to: `${GA_MEASUREMENT_ID}/conversion`,
    event_category: 'conversion',
    event_label: conversionType,
    value: 1,
    currency: 'USD',
    conversion_type: conversionType,
    conversion_value: conversionValue,
  });

  console.log('Conversion tracked:', { conversionType, conversionValue });
}

/**
 * Track Core Web Vitals for performance monitoring
 */
export function trackWebVital(metric: WebVital): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    // Use a custom metric to avoid sampling
    custom_parameter_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });

  console.log('Web Vital tracked:', metric);
}

/**
 * Track user engagement events
 */
export function trackEngagement(engagementType: string, details?: Record<string, any>): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'engagement', {
    event_category: 'engagement',
    event_label: engagementType,
    custom_parameters: {
      engagement_type: engagementType,
      ...details,
      timestamp: Date.now(),
    },
  });

  console.log('Engagement tracked:', { engagementType, details });
}

/**
 * Track external link clicks
 */
export function trackOutboundLink(url: string, linkText?: string): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'click', {
    event_category: 'outbound',
    event_label: url,
    transport_type: 'beacon',
    custom_parameters: {
      link_url: url,
      link_text: linkText,
    },
  });

  console.log('Outbound link tracked:', { url, linkText });
}

/**
 * Track file downloads
 */
export function trackDownload(fileName: string, fileType: string): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'file_download', {
    event_category: 'engagement',
    event_label: fileName,
    custom_parameters: {
      file_name: fileName,
      file_type: fileType,
    },
  });

  console.log('Download tracked:', { fileName, fileType });
}

/**
 * Track search queries (if search is implemented)
 */
export function trackSearch(query: string, results: number): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'search', {
    search_term: query,
    custom_parameters: {
      search_results: results,
    },
  });

  console.log('Search tracked:', { query, results });
}

/**
 * Track timing events (e.g., how long users spend on a section)
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'timing_complete', {
    event_category: category,
    name: variable,
    value,
    event_label: label,
  });

  console.log('Timing tracked:', { category, variable, value, label });
}

/**
 * Track exceptions and errors
 */
export function trackException(description: string, fatal: boolean = false): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'exception', {
    description,
    fatal,
  });

  console.log('Exception tracked:', { description, fatal });
}

/**
 * Check if analytics is enabled and consent is given
 */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (!GA_MEASUREMENT_ID) return false;
  if (!window.gtag) return false;

  return getAnalyticsConsent();
}

/**
 * Get analytics consent from localStorage
 */
export function getAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'true';
  } catch {
    return false;
  }
}

/**
 * Set analytics consent
 */
export function setAnalyticsConsent(consent: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('analytics_consent', consent.toString());
    localStorage.setItem('consent_timestamp', Date.now().toString());

    if (consent && !window.gtag) {
      // Initialize analytics if consent is given and not already initialized
      initializeGA();
    } else if (!consent && window.gtag) {
      // Disable analytics if consent is withdrawn
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }

    console.log('Analytics consent updated:', consent);
  } catch (error) {
    console.error('Failed to set analytics consent:', error);
  }
}

/**
 * Enhanced ecommerce tracking for lead value estimation
 */
export function trackLeadValue(
  leadSource: string,
  estimatedValue: number = 25000 // Default average contract value
): void {
  if (!isAnalyticsEnabled()) return;

  window.gtag('event', 'purchase', {
    transaction_id: `lead_${Date.now()}`,
    value: estimatedValue,
    currency: 'USD',
    items: [
      {
        item_id: 'lead_generation',
        item_name: 'Potential Client Lead',
        category: 'leads',
        quantity: 1,
        price: estimatedValue,
      },
    ],
    custom_parameters: {
      lead_source: leadSource,
      lead_type: 'contact_form',
    },
  });

  console.log('Lead value tracked:', { leadSource, estimatedValue });
}

/**
 * Privacy-compliant user ID tracking (hashed)
 */
export function setPrivacyCompliantUserId(): void {
  if (!isAnalyticsEnabled()) return;

  // Generate a privacy-compliant user ID based on session data
  const sessionData = {
    timestamp: Date.now(),
    userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  // Simple hash function for privacy-compliant ID
  const userId = btoa(JSON.stringify(sessionData)).substring(0, 16);

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId,
  });

  console.log('Privacy-compliant user ID set');
}

/**
 * Performance monitoring integration
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private vitalsBuffer: WebVital[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  trackVital(vital: WebVital): void {
    this.vitalsBuffer.push(vital);
    trackWebVital(vital);

    // Send buffered vitals if we have a complete set
    if (this.vitalsBuffer.length >= 3) {
      this.sendVitalsBatch();
    }
  }

  private sendVitalsBatch(): void {
    if (!isAnalyticsEnabled()) return;

    const vitalsData = this.vitalsBuffer.reduce(
      (acc, vital) => {
        acc[vital.name] = vital.value;
        return acc;
      },
      {} as Record<string, number>
    );

    window.gtag('event', 'web_vitals_batch', {
      event_category: 'performance',
      custom_parameters: vitalsData,
    });

    this.vitalsBuffer = [];
  }

  trackPageLoadTime(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const loadTime = performance.now();
      trackTiming('page_load', 'load_time', Math.round(loadTime), window.location.pathname);
    });
  }
}

// Initialize performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance();
