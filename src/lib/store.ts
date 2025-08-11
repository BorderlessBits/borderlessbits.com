import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useCallback } from 'react';
import type { UIStore, PrivacyConsent } from '@/types';

/**
 * UI state store for managing global application state
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Mobile navigation state
      mobileMenuOpen: false,
      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },
      closeMobileMenu: () => {
        set({ mobileMenuOpen: false });
      },

      // Cookie consent state
      cookieConsent: null,
      setCookieConsent: (consent: boolean) => {
        set({ cookieConsent: consent });
        
        // Store detailed consent in localStorage
        if (typeof window !== 'undefined') {
          const consentData: PrivacyConsent = {
            analytics: consent,
            marketing: false, // Currently we don't use marketing cookies
            timestamp: Date.now(),
          };
          localStorage.setItem('privacy_consent', JSON.stringify(consentData));
        }
      },

      // Theme state (for future dark mode support)
      theme: 'light',
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'ui-storage',
      // Only persist certain fields
      partialize: (state) => ({
        cookieConsent: state.cookieConsent,
        theme: state.theme,
      }),
    }
  )
);

/**
 * Form state for contact form management
 */
interface FormStore {
  isSubmitting: boolean;
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage: string | null;
  setSubmitting: (submitting: boolean) => void;
  setStatus: (status: 'idle' | 'submitting' | 'success' | 'error', message?: string) => void;
  resetForm: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
  isSubmitting: false,
  submitStatus: 'idle',
  errorMessage: null,
  
  setSubmitting: (submitting: boolean) => {
    set({ isSubmitting: submitting });
  },
  
  setStatus: (status: 'idle' | 'submitting' | 'success' | 'error', message?: string) => {
    set({ 
      submitStatus: status,
      errorMessage: message || null,
      isSubmitting: status === 'submitting',
    });
  },
  
  resetForm: () => {
    set({
      isSubmitting: false,
      submitStatus: 'idle',
      errorMessage: null,
    });
  },
}));

/**
 * Analytics and performance tracking store
 */
interface AnalyticsStore {
  pageViews: number;
  sessionStart: number;
  conversionTracked: boolean;
  performanceMetrics: Record<string, number>;
  incrementPageViews: () => void;
  trackConversion: () => void;
  setMetric: (key: string, value: number) => void;
  getSessionDuration: () => number;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      pageViews: 0,
      sessionStart: Date.now(),
      conversionTracked: false,
      performanceMetrics: {},
      
      incrementPageViews: () => {
        set((state) => ({ pageViews: state.pageViews + 1 }));
      },
      
      trackConversion: () => {
        set({ conversionTracked: true });
      },
      
      setMetric: (key: string, value: number) => {
        set((state) => ({
          performanceMetrics: {
            ...state.performanceMetrics,
            [key]: value,
          },
        }));
      },
      
      getSessionDuration: () => {
        const { sessionStart } = get();
        return Date.now() - sessionStart;
      },
    }),
    {
      name: 'analytics-storage',
      // Only persist certain analytics data
      partialize: (state) => ({
        pageViews: state.pageViews,
        sessionStart: state.sessionStart,
        conversionTracked: state.conversionTracked,
      }),
    }
  )
);

/**
 * Content and search state management
 */
interface ContentStore {
  searchQuery: string;
  searchResults: {
    posts: any[];
    caseStudies: any[];
  } | null;
  isSearching: boolean;
  recentSearches: string[];
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any) => void;
  setSearching: (searching: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearSearchResults: () => void;
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      searchResults: null,
      isSearching: false,
      recentSearches: [],
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },
      
      setSearchResults: (results: any) => {
        set({ searchResults: results, isSearching: false });
      },
      
      setSearching: (searching: boolean) => {
        set({ isSearching: searching });
      },
      
      addRecentSearch: (query: string) => {
        if (!query.trim()) return;
        
        set((state) => {
          const filtered = state.recentSearches.filter(s => s !== query);
          return {
            recentSearches: [query, ...filtered].slice(0, 5), // Keep last 5 searches
          };
        });
      },
      
      clearSearchResults: () => {
        set({
          searchQuery: '',
          searchResults: null,
          isSearching: false,
        });
      },
    }),
    {
      name: 'content-storage',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);

/**
 * Performance monitoring store for tracking page load metrics
 */
interface PerformanceStore {
  metrics: {
    [pagePath: string]: {
      loadTime: number;
      fcp: number;
      lcp: number;
      cls: number;
      fid: number;
      ttfb: number;
      timestamp: number;
    };
  };
  addMetric: (path: string, metric: string, value: number) => void;
  getAverageMetric: (metric: string) => number;
  getPageMetrics: (path: string) => any;
}

export const usePerformanceStore = create<PerformanceStore>()(
  persist(
    (set, get) => ({
      metrics: {},
      
      addMetric: (path: string, metric: string, value: number) => {
        set((state) => ({
          metrics: {
            ...state.metrics,
            [path]: {
              ...state.metrics[path],
              [metric]: value,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      getAverageMetric: (metric: string) => {
        const { metrics } = get();
        const values = Object.values(metrics)
          .map(m => m[metric as keyof typeof m])
          .filter(v => typeof v === 'number' && v > 0);
        
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      },
      
      getPageMetrics: (path: string) => {
        const { metrics } = get();
        return metrics[path] || null;
      },
    }),
    {
      name: 'performance-storage',
      // Clean old metrics (keep only last 100 entries)
      partialize: (state) => {
        const entries = Object.entries(state.metrics);
        const sortedEntries = entries
          .sort(([,a], [,b]) => b.timestamp - a.timestamp)
          .slice(0, 100);
        
        return {
          metrics: Object.fromEntries(sortedEntries),
        };
      },
    }
  )
);

/**
 * Utility hooks for common state patterns
 */

// Hook for managing loading states
export function useLoadingState(initialState: boolean = false) {
  const [loading, setLoading] = useState(initialState);
  
  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { loading, setLoading, withLoading };
}

// Hook for managing error states
export function useErrorState() {
  const [error, setError] = useState<string | null>(null);
  
  const clearError = useCallback(() => setError(null), []);
  
  const withErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage: string = 'An error occurred'
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await asyncFn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      setError(message);
      return null;
    }
  }, [clearError]);
  
  return { error, setError, clearError, withErrorHandling };
}

// Hook for managing async operations
export function useAsync<T>() {
  const { loading, withLoading } = useLoadingState();
  const { error, withErrorHandling } = useErrorState();
  
  const execute = useCallback(async (
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    return withLoading(() => withErrorHandling(asyncFn, errorMessage));
  }, [withLoading, withErrorHandling]);
  
  return { loading, error, execute };
}

// Export all stores for easy access
export const stores = {
  ui: useUIStore,
  form: useFormStore,
  analytics: useAnalyticsStore,
  content: useContentStore,
  performance: usePerformanceStore,
};