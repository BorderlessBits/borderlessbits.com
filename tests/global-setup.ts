import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  const { baseURL } = config.projects[0].use;
  
  // Wait for the application to be available
  if (baseURL) {
    console.log(`⏳ Waiting for application at ${baseURL}...`);
    
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Wait for the application to respond with a reasonable timeout
      await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 60000 });
      console.log('✅ Application is ready for testing');
      
      // Pre-warm critical pages
      console.log('🔥 Pre-warming critical pages...');
      const criticalPages = ['/', '/contact', '/about'];
      
      for (const path of criticalPages) {
        try {
          await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
          console.log(`✅ Pre-warmed: ${path}`);
        } catch (error) {
          console.log(`⚠️ Could not pre-warm ${path}:`, error);
        }
      }
      
    } catch (error) {
      console.error(`❌ Application not available at ${baseURL}:`, error);
      throw error;
    } finally {
      await context.close();
      await browser.close();
    }
  }
  
  console.log('✅ Global test setup completed');
}

export default globalSetup;