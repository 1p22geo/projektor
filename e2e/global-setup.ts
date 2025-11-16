import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Clean up test database before running tests
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
    throw error;
  }
  
  // Wait for services to be ready
  console.log('⏳ Waiting for backend and frontend services...');
  
  // The webServer configuration in playwright.config.ts will handle starting the services
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
