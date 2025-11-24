import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Global teardown for Playwright tests
 * This runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up test database after running tests
  console.log('🧹 Cleaning up test database...');
  try {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'cleanup_test_db.py');
    const backendDir = path.join(__dirname, '..', 'backend');
    
    // Run the cleanup script using the backend's virtual environment
    execSync(`cd ${backendDir} && uv run python ${scriptPath}`, { 
      stdio: 'inherit',
      env: { ...process.env }
    });
  } catch (error) {
    console.error('❌ Failed to clean up test database:', error);
    // Don't throw - we want teardown to continue even if cleanup fails
  }
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
