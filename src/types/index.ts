// Core application types
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  project_type: ProjectType;
  project_timeline: ProjectTimeline;
  message: string;
  budget_range?: BudgetRange;
  referral_source?: ReferralSource;
}

export type ProjectType =
  | 'cloud_architecture'
  | 'healthcare_software'
  | 'enterprise_consulting'
  | 'other';

export type ProjectTimeline =
  | 'immediate'
  | 'within_3_months'
  | 'within_6_months'
  | 'planning_phase';

export type BudgetRange = 'under_25k' | 'from_25k_to_50k' | 'from_50k_to_100k' | 'over_100k';

export type ReferralSource = 'google_search' | 'linkedin' | 'referral' | 'other';

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

export interface FormState {
  formData: ContactFormData;
  errors: FormErrors;
  isSubmitting: boolean;
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';
}

// Content management types
export interface PostMetadata {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  featured: boolean;
  seo: {
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
  };
}

export interface Post extends PostMetadata {
  slug: string;
  content: string;
  readingTime: number;
}

export interface CaseStudy extends PostMetadata {
  slug: string;
  content: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
  }[];
  technologies: string[];
  timeline: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  icon: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
}

// UI State types
export interface UIStore {
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  cookieConsent: boolean | null;
  setCookieConsent: (consent: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

// Analytics and monitoring types
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  id: string;
  delta: number;
}

export interface MonitoringConfig {
  googleAnalytics: {
    measurementId: string;
    debug: boolean;
  };
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  recaptcha?: {
    siteKey: string;
  };
}

// SEO and metadata types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  nofollow?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

// API and error handling types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EmailSubmissionResult {
  success: boolean;
  service: 'netlify' | 'emailjs' | 'fallback';
  message: string;
  timestamp: number;
}

// Privacy and compliance types
export interface PrivacyConsent {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavigationItem[];
}
