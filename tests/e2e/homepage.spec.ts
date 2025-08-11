import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load successfully', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/BorderlessBits/);

    // Check that the page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display main navigation', async ({ page }) => {
    // Check main navigation elements
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Common navigation items that should be present
    const expectedNavItems = ['Home', 'About', 'Services', 'Contact'];

    for (const item of expectedNavItems) {
      const navLink = page.locator('nav').getByRole('link', { name: item });
      if ((await navLink.count()) > 0) {
        await expect(navLink).toBeVisible();
      }
    }
  });

  test('should display hero section', async ({ page }) => {
    // Check for main hero content
    const heroSection = page.locator('[data-testid="hero"]').or(page.locator('section').first());
    await expect(heroSection).toBeVisible();

    // Check for key messaging
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/BorderlessBits|Cloud|Architecture|Healthcare/);
  });

  test('should have working contact CTA', async ({ page }) => {
    // Look for contact call-to-action buttons
    const contactButton = page
      .getByRole('link', { name: /contact|get started|let's talk/i })
      .first();

    if ((await contactButton.count()) > 0) {
      await expect(contactButton).toBeVisible();
      await expect(contactButton).toBeEnabled();

      // Test that it navigates to contact page
      await contactButton.click();
      await expect(page).toHaveURL(/.*contact.*/);
    }
  });

  test('should display services section', async ({ page }) => {
    // Check for services section
    const servicesSection = page
      .locator('[data-testid="services"]')
      .or(
        page
          .locator('text=Services')
          .or(page.locator('text=What we do'))
          .locator('xpath=ancestor::section[1]')
      );

    if ((await servicesSection.count()) > 0) {
      await expect(servicesSection).toBeVisible();

      // Check for service items
      const serviceItems = servicesSection.locator('div, article').filter({
        hasText: /cloud|architecture|healthcare|consulting/i,
      });

      if ((await serviceItems.count()) > 0) {
        await expect(serviceItems.first()).toBeVisible();
      }
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check essential meta tags
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');

    if ((await ogTitle.count()) > 0) {
      await expect(ogTitle).toHaveAttribute('content', /.+/);
    }

    if ((await ogDescription.count()) > 0) {
      await expect(ogDescription).toHaveAttribute('content', /.+/);
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile');

    // Check that mobile navigation works
    const mobileMenuButton = page.getByRole('button', { name: /menu|hamburger|navigation/i });

    if ((await mobileMenuButton.count()) > 0) {
      await expect(mobileMenuButton).toBeVisible();

      // Test mobile menu functionality
      await mobileMenuButton.click();

      const mobileMenu = page.locator('nav').or(page.locator('[data-testid="mobile-menu"]'));
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip to main/i });
    if ((await skipLink.count()) > 0) {
      await expect(skipLink).toBeVisible();
    }

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Should have exactly one h1

    // Check that navigation has proper ARIA labels
    const navigation = page.locator('nav').first();
    if ((await navigation.count()) > 0) {
      const ariaLabel = await navigation.getAttribute('aria-label');
      const role = await navigation.getAttribute('role');

      // Navigation should be properly labeled
      expect(ariaLabel || role).toBeTruthy();
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow for some time for any async errors
    await page.waitForTimeout(2000);

    // Filter out known third-party errors (like analytics)
    const significantErrors = errors.filter(
      error =>
        !error.includes('google-analytics') &&
        !error.includes('gtag') &&
        !error.includes('googleapis') &&
        !error.includes('Non-Error promise rejection captured')
    );

    expect(significantErrors).toHaveLength(0);
  });
});
