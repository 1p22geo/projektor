import { FullConfig } from '@playwright/test';

/**
 * Global teardown for Playwright tests
 * This runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up test data
  // For example:
  // 1. Clear test database
  // 2. Remove uploaded test files
  // 3. Clean up any test artifacts
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
