import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Hide dynamic content that might cause flaky tests
    await page.addInitScript(() => {
      // Hide elements that contain dynamic content
      const style = document.createElement('style');
      style.textContent = `
        [data-testid="current-time"],
        .loading-spinner,
        .progress-bar,
        [data-dynamic="true"] {
          visibility: hidden !important;
        }
        
        /* Ensure fonts are loaded */
        * {
          font-family: system-ui, -apple-system, sans-serif !important;
        }
      `;
      document.head.appendChild(style);
    });
  });

  test('homepage desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Wait for page to be fully loaded and stable
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Additional wait for any animations

    // Hide any dynamic content
    await page
      .locator('.animate-pulse, .spinner, .loading')
      .evaluateAll(els => els.forEach(el => ((el as HTMLElement).style.visibility = 'hidden')));

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 1000,
    });
  });

  test('homepage tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 800,
    });
  });

  test('homepage mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 600,
    });
  });

  test('contact page desktop layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/contact');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('contact-desktop.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 1000,
    });
  });

  test('contact page mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/contact');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('contact-mobile.png', {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 600,
    });
  });

  test('navigation component states', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav').first();

    // Default navigation state
    await expect(nav).toHaveScreenshot('navigation-default.png', {
      threshold: 0.1,
    });

    // Test mobile menu if it exists
    const mobileMenuButton = page.getByRole('button', { name: /menu|hamburger/i });
    if ((await mobileMenuButton.count()) > 0) {
      await page.setViewportSize({ width: 375, height: 667 });
      await mobileMenuButton.click();
      await page.waitForTimeout(500); // Wait for menu animation

      const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(nav);
      await expect(mobileMenu).toHaveScreenshot('navigation-mobile-open.png', {
        threshold: 0.1,
      });
    }
  });

  test('form component visual states', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').first();

    // Empty form state
    await expect(form).toHaveScreenshot('form-empty.png', {
      threshold: 0.1,
    });

    // Filled form state
    const nameField = form.locator('input[name="name"], input[name="from_name"]').first();
    const emailField = form.locator('input[name="email"], input[name="from_email"]').first();
    const messageField = form.locator('textarea[name="message"]').first();

    if ((await nameField.count()) > 0) {
      await nameField.fill('John Doe');
    }
    if ((await emailField.count()) > 0) {
      await emailField.fill('john@example.com');
    }
    if ((await messageField.count()) > 0) {
      await messageField.fill('This is a test message.');
    }

    await expect(form).toHaveScreenshot('form-filled.png', {
      threshold: 0.1,
    });

    // Form validation state (if validation exists)
    await emailField.fill('invalid-email');
    await emailField.blur();
    await page.waitForTimeout(500);

    await expect(form).toHaveScreenshot('form-validation-error.png', {
      threshold: 0.1,
    });
  });

  test('hero section component', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const heroSection = page.locator('[data-testid="hero"]').or(page.locator('section').first());

    if ((await heroSection.count()) > 0) {
      await expect(heroSection).toHaveScreenshot('hero-section.png', {
        threshold: 0.2,
      });
    }
  });

  test('footer component', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');

    if ((await footer.count()) > 0) {
      await expect(footer).toHaveScreenshot('footer-component.png', {
        threshold: 0.1,
      });
    }
  });

  test('responsive breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large-desktop', width: 1920, height: 1080 },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height,
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Test key sections at each breakpoint
      const heroSection = page.locator('[data-testid="hero"]').or(page.locator('section').first());

      if ((await heroSection.count()) > 0) {
        await expect(heroSection).toHaveScreenshot(`hero-${breakpoint.name}.png`, {
          threshold: 0.2,
          maxDiffPixels: 800,
        });
      }
    }
  });

  test('dark mode support (if implemented)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if dark mode toggle exists
    const darkModeToggle = page.getByRole('button', { name: /dark|theme/i });

    if ((await darkModeToggle.count()) > 0) {
      // Test default (light) mode
      await expect(page).toHaveScreenshot('homepage-light-mode.png', {
        fullPage: true,
        threshold: 0.2,
      });

      // Switch to dark mode
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition

      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        threshold: 0.2,
      });
    }
  });

  test('loading states (if implemented)', async ({ page }) => {
    // Test loading states by intercepting network requests
    await page.route('**/*', route => {
      // Delay responses to capture loading states
      setTimeout(() => route.continue(), 1000);
    });

    const gotoPromise = page.goto('/');

    // Capture loading state
    await page.waitForSelector('body', { timeout: 2000 });

    const loadingElement = page.locator('.loading, .spinner, [data-testid="loading"]').first();

    if ((await loadingElement.count()) > 0) {
      await expect(loadingElement).toHaveScreenshot('loading-state.png', {
        threshold: 0.1,
      });
    }

    await gotoPromise;
  });

  test('error states (404 page)', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');

    // Check if custom 404 page exists
    const is404 =
      (await page.locator('text=404').count()) > 0 ||
      (await page.locator('text=Not Found').count()) > 0 ||
      (await page.title().then(title => title.includes('404')));

    if (is404) {
      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
        threshold: 0.2,
      });
    }
  });

  test('accessibility focus states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test keyboard navigation focus states
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    const focusedElement = page.locator(':focus').first();

    if ((await focusedElement.count()) > 0) {
      await expect(focusedElement).toHaveScreenshot('focus-state.png', {
        threshold: 0.1,
      });
    }

    // Test multiple tab stops
    let tabCount = 0;
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      tabCount++;
    }

    const currentFocused = page.locator(':focus').first();
    if ((await currentFocused.count()) > 0) {
      await expect(currentFocused).toHaveScreenshot(`focus-state-${tabCount + 2}.png`, {
        threshold: 0.1,
      });
    }
  });
});
