import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');

  // Cleanup any global resources if needed
  // For example: close database connections, clean up test data, etc.

  console.log('✅ Global test teardown completed');
}

export default globalTeardown;
