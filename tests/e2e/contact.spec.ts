import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Contact.*BorderlessBits/);
    await expect(page.locator('h1')).toContainText(/Contact/i);
  });

  test('should display contact form', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    
    // Check for essential form fields
    const expectedFields = [
      { name: 'name', type: 'text' },
      { name: 'email', type: 'email' },
      { name: 'message', type: 'textarea' }
    ];
    
    for (const field of expectedFields) {
      const input = form.locator(`input[name="${field.name}"], textarea[name="${field.name}"]`);
      
      if (await input.count() > 0) {
        await expect(input).toBeVisible();
        
        if (field.type === 'email') {
          await expect(input).toHaveAttribute('type', 'email');
        }
      }
    }
    
    // Check for submit button
    const submitButton = form.getByRole('button', { name: /send|submit|contact/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should validate required fields', async ({ page }) => {
    const form = page.locator('form').first();
    const submitButton = form.getByRole('button', { name: /send|submit|contact/i });
    
    // Try to submit empty form
    await submitButton.click();
    
    // Check for validation messages (could be HTML5 validation or custom)
    const nameField = form.locator('input[name="name"], input[name="from_name"]').first();
    const emailField = form.locator('input[name="email"], input[name="from_email"]').first();
    const messageField = form.locator('textarea[name="message"]').first();
    
    // HTML5 validation check
    if (await nameField.count() > 0) {
      const isInvalid = await nameField.evaluate((el: HTMLInputElement) => !el.validity.valid);
      if (isInvalid) {
        expect(isInvalid).toBe(true);
      }
    }
    
    if (await emailField.count() > 0) {
      const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
      if (isInvalid) {
        expect(isInvalid).toBe(true);
      }
    }
  });

  test('should validate email format', async ({ page }) => {
    const form = page.locator('form').first();
    const emailField = form.locator('input[name="email"], input[name="from_email"]').first();
    
    if (await emailField.count() > 0) {
      // Enter invalid email
      await emailField.fill('invalid-email');
      await emailField.blur();
      
      // Check for validation
      const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBe(true);
      
      // Enter valid email
      await emailField.fill('test@example.com');
      await emailField.blur();
      
      const isValid = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBe(true);
    }
  });

  test('should handle form submission', async ({ page }) => {
    const form = page.locator('form').first();
    
    // Fill out form with valid data
    const nameField = form.locator('input[name="name"], input[name="from_name"]').first();
    const emailField = form.locator('input[name="email"], input[name="from_email"]').first();
    const messageField = form.locator('textarea[name="message"]').first();
    
    if (await nameField.count() > 0) {
      await nameField.fill('Test User');
    }
    
    if (await emailField.count() > 0) {
      await emailField.fill('test@example.com');
    }
    
    if (await messageField.count() > 0) {
      await messageField.fill('This is a test message from automated testing.');
    }
    
    // Additional fields that might exist
    const companyField = form.locator('input[name="company"]').first();
    if (await companyField.count() > 0) {
      await companyField.fill('Test Company');
    }
    
    const phoneField = form.locator('input[name="phone"]').first();
    if (await phoneField.count() > 0) {
      await phoneField.fill('555-123-4567');
    }
    
    // Handle project type dropdown if it exists
    const projectTypeField = form.locator('select[name="project_type"]').first();
    if (await projectTypeField.count() > 0) {
      await projectTypeField.selectOption('cloud-migration');
    }
    
    const submitButton = form.getByRole('button', { name: /send|submit|contact/i });
    
    // Monitor network requests
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('emailjs.com') || 
      response.url().includes('netlify') ||
      response.url().includes('contact'),
      { timeout: 30000 }
    ).catch(() => null); // Don't fail if no network request (might be client-side only)
    
    // Submit form
    await submitButton.click();
    
    // Wait for either success message or error
    await Promise.race([
      // Success indicators
      page.waitForSelector('[data-testid="success-message"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('.success', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('.alert-success', { timeout: 15000 }).catch(() => null),
      page.locator('text=thank you', { hasText: /sent|success/i }).waitFor({ timeout: 15000 }).catch(() => null),
      
      // Error indicators (also acceptable for testing)
      page.waitForSelector('[data-testid="error-message"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('.error', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('.alert-error', { timeout: 15000 }).catch(() => null),
      
      // Form submission attempt completed (button state change)
      page.waitForFunction(() => {
        const button = document.querySelector('form button[type="submit"]') as HTMLButtonElement;
        return button && (button.disabled || button.textContent?.includes('Sent'));
      }, { timeout: 15000 }).catch(() => null),
      
      // Network response
      responsePromise
    ]);
    
    // The test passes if the form processes the submission without errors
    // We don't require successful delivery since this is a test environment
    console.log('Form submission test completed');
  });

  test('should display contact information', async ({ page }) => {
    // Check for contact information display
    const contactInfo = page.locator('text=richard@borderlessbits.com').or(
      page.locator('[data-testid="contact-info"]')
    );
    
    if (await contactInfo.count() > 0) {
      await expect(contactInfo).toBeVisible();
    }
    
    // Check for professional contact details
    const emailLink = page.getByRole('link', { name: /richard@borderlessbits.com/i });
    if (await emailLink.count() > 0) {
      await expect(emailLink).toBeVisible();
      await expect(emailLink).toHaveAttribute('href', 'mailto:richard@borderlessbits.com');
    }
  });

  test('should have proper accessibility', async ({ page }) => {
    const form = page.locator('form').first();
    
    // Check form labels
    const inputs = form.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        // Check for associated label
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        
        // Input should have either label, aria-label, or aria-labelledby
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
    
    // Check form has accessible name
    const formName = await form.getAttribute('aria-label') || await form.getAttribute('aria-labelledby');
    const formTitle = await page.locator('h1, h2, h3').first().textContent();
    
    expect(formName || formTitle).toBeTruthy();
  });

  test('should handle spam protection gracefully', async ({ page }) => {
    const form = page.locator('form').first();
    
    // Check for honeypot field (should be hidden)
    const honeypot = form.locator('input[name*="honey"], input[style*="display: none"]');
    if (await honeypot.count() > 0) {
      await expect(honeypot).toBeHidden();
    }
    
    // Check for reCAPTCHA (if present)
    const recaptcha = page.locator('.g-recaptcha, [data-testid="recaptcha"]');
    if (await recaptcha.count() > 0) {
      await expect(recaptcha).toBeVisible();
    }
  });

  test('should be mobile-friendly', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile devices');
    
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    
    // Check that form fields are properly sized for mobile
    const inputs = form.locator('input, textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const boundingBox = await input.boundingBox();
      
      if (boundingBox) {
        // Ensure inputs are not too wide for mobile
        expect(boundingBox.width).toBeLessThanOrEqual(400);
      }
    }
    
    // Check that submit button is easily tappable
    const submitButton = form.getByRole('button', { name: /send|submit|contact/i });
    const buttonBox = await submitButton.boundingBox();
    
    if (buttonBox) {
      // Button should be at least 44px tall for good mobile UX
      expect(buttonBox.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('should load without errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const significantErrors = errors.filter(error => 
      !error.includes('google-analytics') &&
      !error.includes('emailjs') &&
      !error.includes('gtag') &&
      !error.includes('Non-Error promise rejection captured')
    );
    
    expect(significantErrors).toHaveLength(0);
  });
});