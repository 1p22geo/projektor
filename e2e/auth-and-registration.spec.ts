import { test, expect } from '@playwright/test';
import {
  generateId,
  loginAsAdmin,
  loginAsHeadteacher,
  createSchool,
  generateTokens,
  registerStudent,
  loginAsStudent,
  logoutStudent,
} from './helpers';

test.describe('User Story 3: School Token Generation', () => {
  let schoolEmail: string;
  let schoolPassword: string;

  test.beforeEach(async ({ page }) => {
    // Create a school as admin
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
    await loginAsAdmin(page, adminPassword);
    
    const schoolName = generateId('school');
    schoolEmail = `${generateId('headteacher')}@example.com`;
    schoolPassword = await createSchool(page, schoolName, schoolEmail);
    
    // Logout admin
    await page.click('[data-testid="logout"]');
  });

  test('Headteacher can log in with school credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', schoolEmail);
    await page.fill('input[name="password"]', schoolPassword);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('Headteacher can generate registration tokens', async ({ page }) => {
    await loginAsHeadteacher(page, schoolEmail, schoolPassword);
    
    // Navigate to tokens section
    await page.click('text=Tokens');
    
    // Generate 5 tokens
    const tokenCount = 5;
    await page.fill('input[name="count"]', tokenCount.toString());
    await page.click('button:has-text("Generate")');
    
    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText('Tokens generated successfully');
    
    // Should display the tokens
    const tokens = await page.locator('[data-testid="token"]').all();
    expect(tokens.length).toBe(tokenCount);
    
    // Each token should be unique
    const tokenValues = await Promise.all(tokens.map(t => t.textContent()));
    const uniqueTokens = new Set(tokenValues);
    expect(uniqueTokens.size).toBe(tokenCount);
  });

  test('Generated tokens can be copied', async ({ page }) => {
    await loginAsHeadteacher(page, schoolEmail, schoolPassword);
    
    await page.click('text=Tokens');
    await page.fill('input[name="count"]', '3');
    await page.click('button:has-text("Generate")');
    
    // Click copy button for first token
    await page.locator('[data-testid="copy-token"]').first().click();
    
    // Should show copied message
    await expect(page.locator('[role="alert"]')).toContainText('Token copied');
  });

  test('Tokens can be downloaded as CSV', async ({ page }) => {
    await loginAsHeadteacher(page, schoolEmail, schoolPassword);
    
    await page.click('text=Tokens');
    await page.fill('input[name="count"]', '10');
    await page.click('button:has-text("Generate")');
    
    // Download tokens
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    const download = await downloadPromise;
    
    // Verify filename
    expect(download.suggestedFilename()).toMatch(/tokens.*\.csv/);
  });
});

test.describe('User Story 4: Student Registration', () => {
  let registrationToken: string;

  test.beforeEach(async ({ page }) => {
    // Create a school and generate tokens
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
    await loginAsAdmin(page, adminPassword);
    
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    const schoolPassword = await createSchool(page, schoolName, schoolEmail);
    
    // Logout and login as headteacher
    await page.click('[data-testid="logout"]');
    await loginAsHeadteacher(page, schoolEmail, schoolPassword);
    
    // Generate tokens
    const tokens = await generateTokens(page, 5);
    registrationToken = tokens[0];
    
    // Logout
    await page.click('[data-testid="logout"]');
  });

  test('Student can register with valid token', async ({ page }) => {
    const studentName = generateId('student');
    const studentEmail = `${generateId('student')}@example.com`;
    const studentPassword = 'StudentPass123!';
    
    await page.goto('/register');
    
    await page.fill('input[name="token"]', registrationToken);
    await page.fill('input[name="name"]', studentName);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.fill('input[name="confirmPassword"]', studentPassword);
    await page.click('button[type="submit"]');
    
    // Should auto-login and redirect to competitions
    await page.waitForURL('/competitions', { timeout: 10000 });
  });

  test('Student cannot register with invalid token', async ({ page }) => {
    const studentName = generateId('student');
    const studentEmail = `${generateId('student')}@example.com`;
    const studentPassword = 'StudentPass123!';
    
    await page.goto('/register');
    
    await page.fill('input[name="token"]', 'invalid_token_12345');
    await page.fill('input[name="name"]', studentName);
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.fill('input[name="confirmPassword"]', studentPassword);
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid');
    
    // Should not redirect
    await expect(page).toHaveURL(/\/register/);
  });

  test('Student cannot register with already used token', async ({ page }) => {
    const studentName1 = generateId('student');
    const studentEmail1 = `${generateId('student')}@example.com`;
    const studentPassword = 'StudentPass123!';
    
    // First registration
    await registerStudent(page, registrationToken, studentName1, studentEmail1, studentPassword);
    await logoutStudent(page);
    
    // Try to register again with same token
    const studentName2 = generateId('student');
    const studentEmail2 = `${generateId('student')}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="token"]', registrationToken);
    await page.fill('input[name="name"]', studentName2);
    await page.fill('input[name="email"]', studentEmail2);
    await page.fill('input[name="password"]', studentPassword);
    await page.fill('input[name="confirmPassword"]', studentPassword);
    await page.click('button[type="submit"]');
    
    // Should show error message (either "already used" or generic error)
    await expect(page.locator('[role="alert"]')).toBeVisible();
    // Stay on registration page
    await expect(page).toHaveURL(/\/register/);
  });

  test('Registration validates email format', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="token"]', registrationToken);
    await page.fill('input[name="name"]', 'Test Student');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'StudentPass123!');
    await page.fill('input[name="confirmPassword"]', 'StudentPass123!');
    
    // The submit button may be disabled or clicking may show an error
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isEnabled()) {
      await submitButton.click();
      // Should show validation error
      await expect(page.locator('[role="alert"]')).toBeVisible();
    } else {
      // Button is disabled, which is also valid behavior
      await expect(submitButton).toBeDisabled();
    }
  });

  test('Registration validates password confirmation', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="token"]', registrationToken);
    await page.fill('input[name="name"]', 'Test Student');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'StudentPass123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    
    // The submit button may be disabled or clicking may show an error
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isEnabled()) {
      await submitButton.click();
      // Should show validation error
      await expect(page.locator('[role="alert"]')).toBeVisible();
    } else {
      // Button is disabled, which is also valid behavior
      await expect(submitButton).toBeDisabled();
    }
  });
});

test.describe('User Story 5: Student Login', () => {
  let studentEmail: string;
  let studentPassword: string;

  test.beforeEach(async ({ page }) => {
    // Create school, generate token, register student
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
    await loginAsAdmin(page, adminPassword);
    
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    const schoolPassword = await createSchool(page, schoolName, schoolEmail);
    
    await page.click('[data-testid="logout"]');
    await loginAsHeadteacher(page, schoolEmail, schoolPassword);
    
    const tokens = await generateTokens(page, 1);
    await page.click('[data-testid="logout"]');
    
    const studentName = generateId('student');
    studentEmail = `${generateId('student')}@example.com`;
    studentPassword = 'StudentPass123!';
    
    await registerStudent(page, tokens[0], studentName, studentEmail, studentPassword);
    // Logout after auto-login from registration
    await logoutStudent(page);
  });

  test('Student can log in and see competitions', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or home
    await expect(async () => {
      const url = page.url();
      expect(url).not.toContain('/login');
    }).toPass({ timeout: 10000 });
    
    // Should have competitions or teams section - wait for it to be visible
    await expect(page.locator('h3, h4, h5').filter({ hasText: 'Competitions' }).or(page.getByRole('heading', { name: /competitions/i }))).toBeVisible({ timeout: 5000 });
  });

  test('Student cannot log in with wrong password', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error message (text may vary)
    await expect(page.locator('[role="alert"]')).toBeVisible();
    
    // Should not redirect
    await expect(page).toHaveURL(/\/login/);
  });

  test('Student can logout', async ({ page }) => {
    await loginAsStudent(page, studentEmail, studentPassword);
    
    // Logout
    await logoutStudent(page);
    
    // Should redirect to login
    await page.waitForURL('/login');
    
    // Should not be able to access dashboard
    await page.goto('/dashboard');
    await page.waitForURL('/login');
  });
});
