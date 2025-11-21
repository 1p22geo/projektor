import { test, expect, Page } from '@playwright/test';

/**
 * Helper function to generate unique identifiers for test data
 */
export function generateId(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to login as admin
 */
export async function loginAsAdmin(page: Page, password: string) {
  await page.goto('/admin/login');
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin/dashboard');
}

/**
 * Helper function to login as headteacher
 */
export async function loginAsHeadteacher(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

/**
 * Helper function to login as student
 */
export async function loginAsStudent(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
}

/**
 * Helper function to create a school as admin
 */
export async function createSchool(page: Page, schoolName: string, email: string) {
  // Navigate to schools page
  await page.click('button:has-text("Schools")');
  await page.waitForURL('/admin/schools', { timeout: 10000 });
  
  // Open create dialog
  await page.click('button:has-text("Create School")');
  await page.waitForSelector('input[name="name"]', { state: 'visible', timeout: 5000 });
  
  // Fill in form
  await page.fill('input[name="name"]', schoolName);
  await page.fill('input[name="email"]', email);
  
  // Submit and wait for response
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-testid="generated-password"]', { timeout: 15000 });

  // Get generated password from the UI
  const passwordElement = await page.locator('[data-testid="generated-password"]').textContent();

  // Close the dialog
  await page.click('button:has-text("Close")');
  
  // Wait for dialog to close and list to refresh
  await page.waitForSelector('input[name="name"]', { state: 'hidden', timeout: 5000 });
  await page.waitForTimeout(500);

  return passwordElement || '';
}

/**
 * Helper function to generate registration tokens
 */
export async function generateTokens(page: Page, count: number): Promise<string[]> {
  // Navigate to headteacher dashboard if not already there
  if (!page.url().includes('/dashboard')) {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  }

  await page.fill('input[name="count"]', count.toString());
  await page.click('button:has-text("Generate")');

  // Wait for tokens to appear
  await page.waitForSelector('[data-testid="token"]');

  const tokens: string[] = [];
  const tokenElements = await page.locator('[data-testid="token"]').all();
  for (const element of tokenElements) {
    const token = await element.textContent();
    if (token) tokens.push(token);
  }

  return tokens;
}

/**
 * Helper function to register a student
 */
export async function registerStudent(
  page: Page,
  token: string,
  name: string,
  email: string,
  password: string
) {
  await page.goto('/register');
  await page.fill('input[name="token"]', token);
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect after successful registration (auto-login)
  await page.waitForURL((url) => !url.pathname.includes('/register'), { timeout: 10000 });
}

/**
 * Helper function to create a competition
 */
export async function createCompetition(
  page: Page,
  name: string,
  maxTeams: number,
  maxMembers: number,
  scope: 'school' | 'global' = 'school'
) {
  // Navigate to competition management page
  await page.goto('/headteacher/competitions');
  await page.waitForLoadState('networkidle');

  await page.click('button:has-text("Create Competition")');
  await page.fill('input[name="name"]', name);
  await page.fill('textarea[name="description"]', 'Test competition description');
  await page.fill('input[name="maxTeams"]', maxTeams.toString());
  await page.fill('input[name="maxMembers"]', maxMembers.toString());

  // Select scope using MUI dropdown
  await page.click('[role="combobox"]');
  await page.waitForSelector('[role="listbox"]');
  const optionText = scope === 'global' ? 'Global' : 'School Only';
  await page.locator(`[role="option"]:has-text("${optionText}")`).click();
  await page.click('button[type="submit"]');
  
  // Wait for success message
  await page.waitForSelector('[role="alert"]', { timeout: 5000 }).catch(() => {});
  // Wait a bit for the competition to appear in the list
  await page.waitForTimeout(1000);
}

/**
 * Helper function to create a team
 */
export async function createTeam(page: Page, competitionId: string, teamName: string) {
  await page.goto(`/competitions/${competitionId}`);
  await page.click('button:has-text("Create Team")');
  await page.fill('input[name="name"]', teamName);
  await page.click('button[type="submit"]');
  // Wait for redirect to team page
  await page.waitForURL(/\/teams\/.+/, { timeout: 10000 });
  await page.waitForTimeout(500);
}

/**
 * Helper function to request to join a team
 */
export async function requestToJoinTeam(page: Page, teamId: string) {
  await page.goto(`/teams/${teamId}`);
  await page.click('button:has-text("Join Team")');
}

/**
 * Helper function to approve a join request
 */
export async function approveJoinRequest(page: Page, requestId: string) {
  await page.click(`[data-testid="approve-${requestId}"]`);
}

/**
 * Helper function to send a chat message
 */
export async function sendChatMessage(page: Page, message: string) {
  // First ensure we're on the Chat tab
  try {
    await page.click('[role="tab"]:has-text("Chat")', { timeout: 3000 });
    await page.waitForTimeout(500);
  } catch (e) {
    // Tab might already be selected or not exist
  }
  
  // Type the message to trigger onChange properly
  const input = page.locator('input[placeholder="Type a message..."]').or(page.locator('[name="message"]'));
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.click();
  await input.fill(''); // Clear first
  await input.pressSequentially(message, { delay: 50 }); // Use pressSequentially to trigger onChange events
  await page.waitForTimeout(800); // Give React time to update state
  
  // Wait for the button to be enabled (not disabled) - try multiple selectors
  const submitButton = page.locator('button[type="submit"]:has-text("Send"):not([disabled])').or(
    page.locator('button:has-text("Send"):not([disabled])')
  ).first();
  await submitButton.waitFor({ state: 'visible', timeout: 10000 });
  await submitButton.click();
  // Give it a moment for message to be sent
  await page.waitForTimeout(1500);
}

/**
 * Helper function to upload a file
 */
export async function uploadFile(page: Page, filePath: string) {
  await page.setInputFiles('input[type="file"]', filePath);
  await page.click('button:has-text("Upload")');
}

/**
 * Helper function to logout from student dashboard
 */
export async function logoutStudent(page: Page) {
  // Navigate to a page that has the user menu
  try {
    await page.goto('http://localhost:8080/competitions', { timeout: 5000 });
    await page.waitForTimeout(500);
  } catch (e) {
    // May already be on a page with user menu
  }
  
  // Click user menu to reveal logout option
  try {
    await page.click('[data-testid="user-menu"]', { timeout: 5000 });
  } catch (e) {
    // Try alternative - might be a logout button directly
    await page.click('[data-testid="logout"]', { timeout: 5000 });
    await page.waitForURL('/login');
    return;
  }
  
  await page.waitForSelector('[data-testid="logout"]', { timeout: 5000 });
  await page.click('[data-testid="logout"]');
  await page.waitForURL('/login');
}

/**
 * Helper function to clean up MongoDB database
 */
export async function cleanupDatabase() {
  // This would connect to MongoDB and clear test data
  // Implementation depends on your MongoDB setup
  // For now, we'll assume the backend has a test cleanup endpoint
  const response = await fetch('http://localhost:8000/api/test/cleanup', {
    method: 'POST',
  });
  if (!response.ok) {
    console.warn('Failed to cleanup database');
  }
}
