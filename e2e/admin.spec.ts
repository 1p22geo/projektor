import { test, expect } from '@playwright/test';
import { generateId, loginAsAdmin, createSchool } from './helpers';

test.describe('User Story 1: Admin Login', () => {
  let adminPassword: string;

  test.beforeAll(async () => {
    // In a real scenario, we would capture the password from console output
    // For testing, we'll use the password from environment or a known value
    adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
  });

  test('Admin can log in with password generated at startup', async ({ page }) => {
    await page.goto('/admin/login');

    // Verify login page is displayed
    await expect(page.locator('h1')).toContainText('Admin Login');

    // Fill in the admin password
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"]');

    // Should redirect to admin dashboard
    await page.waitForURL('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('Admin cannot log in with incorrect password', async ({ page }) => {
    await page.goto('/admin/login');

    // Try to log in with wrong password
    await page.fill('input[name="password"]', 'wrong_password');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid password');

    // Should not redirect
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Admin dashboard is restricted without authentication', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/admin/dashboard');

    // Should redirect to login
    await page.waitForURL('/admin/login');
  });
});

test.describe('User Story 2: Admin Account Management', () => {
  let adminPassword: string;

  test.beforeAll(async () => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
  });

  test('Admin can create a new school account', async ({ page }) => {
    await loginAsAdmin(page, adminPassword);

    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;

    // Navigate to schools management
    await page.click('button:has-text("Schools")');
    await page.waitForURL('**/admin/schools');
    await expect(page.locator('h2')).toContainText('Schools');

    // Create new school
    await page.click('button:has-text("Create School")');
    await page.fill('input[name="name"]', schoolName);
    await page.fill('input[name="email"]', schoolEmail);
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('[role="alert"]').filter({ hasText: 'School created successfully' })).toBeVisible();

    // Should display generated password
    const password = await page.locator('[data-testid="generated-password"]').textContent();
    expect(password).toBeTruthy();
    expect(password?.length).toBeGreaterThan(8);

    // School should appear in the list
    await expect(page.locator(`text=${schoolName}`)).toBeVisible();
  });

  test('Admin can view school details', async ({ page }) => {
    await loginAsAdmin(page, adminPassword);

    // Create a school first
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    await createSchool(page, schoolName, schoolEmail);

    // Click on the school to view details
    await page.click(`text=${schoolName}`);

    // Should show school details
    await expect(page.locator('h2')).toContainText(schoolName);
    await expect(page.locator('text=' + schoolEmail).first()).toBeVisible();
  });

  test('Admin can reset a user password', async ({ page }) => {
    await loginAsAdmin(page, adminPassword);

    // First create a school which will create a headteacher user
    await page.click('button:has-text("Schools")');
    await page.click('button:has-text("Create School")');
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    await page.fill('[name="name"]', schoolName);
    await page.fill('[name="email"]', schoolEmail);
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="generated-password"]')).toBeVisible();


    // Navigate to users management
    await page.click('button:has-text("CLOSE")');
    await page.click('a:has-text("Back to Dashboard")');
    await page.click('button:has-text("Users")');

    // Find a user and reset password
    await page.locator('[data-testid="user-actions"]').first().click();
    await page.waitForSelector('[role="menu"]');
    await page.getByRole('menuitem', { name: 'Reset Password' }).click();

    // Should show new password
    const newPassword = await page.locator('[data-testid="new-password"]').textContent();
    expect(newPassword).toBeTruthy();

    // Should show success message
    await expect(page.locator('[role="alert"]').first()).toContainText('Password reset successfully');
  });

  test('Admin can delete a user account', async ({ page }) => {
    await loginAsAdmin(page, adminPassword);

    // First create a school which will create a headteacher user
    await page.click('button:has-text("Schools")');
    await page.click('button:has-text("Create School")');
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    await page.fill('[name="name"]', schoolName);
    await page.fill('[name="email"]', schoolEmail);
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="generated-password"]')).toBeVisible();

    // Navigate to users management
    await page.click('button:has-text("CLOSE")');
    await page.click('a:has-text("Back to Dashboard")');
    await page.click('button:has-text("Users")');

    // Get the first user's name
    const userName = await page.locator('[data-testid="user-name"]').first().textContent();

    // Delete the user
    await page.locator('[data-testid="user-actions"]').first().click();
    await page.waitForSelector('[role="menu"]');
    await page.getByRole('menuitem', { name: 'Delete user account' }).click();

    // Confirm deletion
    await page.click('button:has-text("Delete user account")');

    // Should show success message
    await expect(page.locator('[role="alert"]').first()).toContainText('User deleted successfully');

    // User should no longer appear in the list
    await expect(page.locator(`text=${userName}`)).not.toBeVisible();
  });

  test('Admin can delete a school account', async ({ page }) => {
    await loginAsAdmin(page, adminPassword);

    // Create a school first
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    await createSchool(page, schoolName, schoolEmail);

    // Set up dialog handler before clicking delete
    page.once('dialog', dialog => dialog.accept());

    // Delete the school - find the row with the school name and click its Delete button
    const row = page.locator('tr', { hasText: schoolName });
    await row.locator('button:has-text("Delete")').click();

    // School should no longer appear in the list
    await expect(page.locator(`text=${schoolName}`)).not.toBeVisible();
  });

  test('Admin can update school information', async ({ page }) => {
    await loginAsAdmin(page, adminPassword);

    // Create a school first
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    await createSchool(page, schoolName, schoolEmail);

    // Click on the school to edit
    await page.click(`text=${schoolName}`);
    await page.click('button:has-text("Edit")');

    // Update school name
    const newSchoolName = generateId('school');
    await page.fill('input[name="name"]', "");
    await page.fill('input[name="name"]', newSchoolName);
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText('School updated successfully');

    // Navigate back to schools list to verify update
    await page.click('text=Schools');

    // Updated name should be visible in the list
    await expect(page.locator(`text=${newSchoolName}`)).toBeVisible();
  });
});
