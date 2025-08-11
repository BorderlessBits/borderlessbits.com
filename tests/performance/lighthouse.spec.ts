import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Lighthouse Performance Tests', () => {
  test('should meet performance thresholds on homepage', async ({ page, browserName }) => {
    // Skip webkit for Lighthouse tests (not supported)
    test.skip(browserName === 'webkit', 'Lighthouse not supported in WebKit');
    
    await page.goto('/');
    
    await playAudit({
      page,
      reports: {
        formats: {
          json: true,
          html: true,
        },
        name: `lighthouse-homepage-${browserName}`,
        directory: 'lighthouse-reports',
      },
      thresholds: {
        performance: 80,
        accessibility: 95,
        'best-practices': 90,
        seo: 95,
        pwa: 50, // Lower threshold for PWA since it's not fully implemented
      },
    });
  });

  test('should meet performance thresholds on contact page', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Lighthouse not supported in WebKit');
    
    await page.goto('/contact');
    
    await playAudit({
      page,
      reports: {
        formats: {
          json: true,
          html: true,
        },
        name: `lighthouse-contact-${browserName}`,
        directory: 'lighthouse-reports',
      },
      thresholds: {
        performance: 80,
        accessibility: 95,
        'best-practices': 90,
        seo: 95,
        pwa: 50,
      },
    });
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals using Performance API
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: { [key: string]: number } = {};
        
        // First Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
          });
        }).observe({ entryTypes: ['paint'] });
        
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            vitals.lcp = lastEntry.startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              vitals.fid = entry.processingStart - entry.startTime;
            }
          });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Give some time for metrics to be collected
        setTimeout(() => {
          resolve(vitals);
        }, 5000);
      });
    });
    
    // Assert Core Web Vitals thresholds
    if ((webVitals as any).fcp) {
      expect((webVitals as any).fcp).toBeLessThan(2000); // FCP < 2s
    }
    
    if ((webVitals as any).lcp) {
      expect((webVitals as any).lcp).toBeLessThan(2500); // LCP < 2.5s
    }
    
    if ((webVitals as any).fid) {
      expect((webVitals as any).fid).toBeLessThan(100); // FID < 100ms
    }
    
    if ((webVitals as any).cls !== undefined) {
      expect((webVitals as any).cls).toBeLessThan(0.1); // CLS < 0.1
    }
  });

  test('should load resources efficiently', async ({ page }) => {
    const resourceSizes: { [key: string]: number[] } = {
      image: [],
      script: [],
      stylesheet: [],
    };
    
    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      const contentLength = headers['content-length'];
      
      if (contentLength) {
        const size = parseInt(contentLength);
        
        if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
          resourceSizes.image.push(size);
        } else if (url.match(/\.js$/)) {
          resourceSizes.script.push(size);
        } else if (url.match(/\.css$/)) {
          resourceSizes.stylesheet.push(size);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check image optimization
    if (resourceSizes.image.length > 0) {
      const largeImages = resourceSizes.image.filter(size => size > 500000); // > 500KB
      expect(largeImages.length).toBeLessThanOrEqual(1); // At most 1 large image
    }
    
    // Check JavaScript bundle sizes
    if (resourceSizes.script.length > 0) {
      const totalJSSize = resourceSizes.script.reduce((sum, size) => sum + size, 0);
      expect(totalJSSize).toBeLessThan(2048000); // Total JS < 2MB
    }
    
    // Check CSS bundle sizes
    if (resourceSizes.stylesheet.length > 0) {
      const totalCSSSize = resourceSizes.stylesheet.reduce((sum, size) => sum + size, 0);
      expect(totalCSSSize).toBeLessThan(200000); // Total CSS < 200KB
    }
  });

  test('should have proper caching headers', async ({ page }) => {
    const cacheableResources = new Map<string, string>();
    
    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      const cacheControl = headers['cache-control'];
      
      // Check static assets have proper caching
      if (url.match(/\.(js|css|png|jpg|jpeg|gif|webp|woff|woff2)$/)) {
        cacheableResources.set(url, cacheControl || 'no-cache');
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify that static assets have caching headers
    for (const [url, cacheControl] of cacheableResources) {
      // Static assets should have some form of caching
      expect(cacheControl).not.toBe('no-cache');
      
      // Long-lived assets should have longer cache times
      if (url.match(/\.(js|css)$/) && url.includes('_next/static')) {
        expect(cacheControl).toMatch(/max-age=\d+/);
      }
    }
  });

  test('should minimize render-blocking resources', async ({ page }) => {
    const renderBlockingResources: string[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      
      // Check for render-blocking CSS
      if (url.match(/\.css$/) && !headers['media']) {
        renderBlockingResources.push(url);
      }
    });
    
    await page.goto('/');
    
    // Wait for First Contentful Paint
    await page.waitForFunction(() => {
      const paintEntries = performance.getEntriesByType('paint');
      return paintEntries.some(entry => entry.name === 'first-contentful-paint');
    }, { timeout: 10000 });
    
    // Should minimize render-blocking resources
    expect(renderBlockingResources.length).toBeLessThanOrEqual(3);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      
      // Check for alt text
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
      
      // Check for loading attribute (lazy loading)
      const loading = await img.getAttribute('loading');
      const isAboveFold = await img.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight;
      });
      
      // Images below the fold should have lazy loading
      if (!isAboveFold) {
        expect(loading).toBe('lazy');
      }
      
      // Check for responsive images
      const srcset = await img.getAttribute('srcset');
      const sizes = await img.getAttribute('sizes');
      
      // Modern Next.js Image component should have srcset for optimization
      if (await img.getAttribute('data-nimg')) {
        expect(srcset || sizes).toBeTruthy();
      }
    }
  });

  test('should preload critical resources', async ({ page }) => {
    await page.goto('/');
    
    // Check for preload links
    const preloadLinks = page.locator('link[rel="preload"]');
    const preloadCount = await preloadLinks.count();
    
    if (preloadCount > 0) {
      // Verify preload resources are critical
      for (let i = 0; i < preloadCount; i++) {
        const link = preloadLinks.nth(i);
        const as = await link.getAttribute('as');
        const href = await link.getAttribute('href');
        
        // Preloaded resources should be critical
        expect(['font', 'style', 'script', 'image'].includes(as || '')).toBeTruthy();
        expect(href).toBeTruthy();
        
        // Font preloads should have crossorigin
        if (as === 'font') {
          const crossorigin = await link.getAttribute('crossorigin');
          expect(crossorigin).toBeTruthy();
        }
      }
    }
  });

  test('should minimize layout shifts', async ({ page }) => {
    await page.goto('/');
    
    // Monitor layout shifts
    const layoutShifts = await page.evaluate(() => {
      return new Promise((resolve) => {
        let cumulativeLayoutShift = 0;
        const shifts: any[] = [];
        
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              cumulativeLayoutShift += layoutShift.value;
              shifts.push({
                value: layoutShift.value,
                sources: layoutShift.sources?.map((source: any) => ({
                  node: source.node?.tagName,
                  previousRect: source.previousRect,
                  currentRect: source.currentRect,
                })),
              });
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Wait for page interactions and potential shifts
        setTimeout(() => {
          resolve({ cumulativeLayoutShift, shifts });
        }, 8000);
      });
    });
    
    const { cumulativeLayoutShift } = layoutShifts as any;
    
    // CLS should be less than 0.1 for good user experience
    expect(cumulativeLayoutShift).toBeLessThan(0.1);
    
    console.log('Cumulative Layout Shift:', cumulativeLayoutShift);
  });
});