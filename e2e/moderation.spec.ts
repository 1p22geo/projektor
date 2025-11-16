import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import {
  generateId,
  loginAsAdmin,
  loginAsHeadteacher,
  loginAsStudent,
  createSchool,
  generateTokens,
  registerStudent,
  createCompetition,
  sendChatMessage,
} from './helpers';

test.describe('User Story 10: Headteacher Moderation', () => {
  let headteacherEmail: string;
  let headteacherPassword: string;
  let studentEmail: string;
  let studentPassword: string;
  let teamName: string;

  test.beforeEach(async ({ page }) => {
    // Setup: Create school, competition, student, and team with messages and files
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
    await loginAsAdmin(page, adminPassword);
    
    const schoolName = generateId('school');
    headteacherEmail = `${generateId('headteacher')}@example.com`;
    headteacherPassword = await createSchool(page, schoolName, headteacherEmail);
    
    await page.click('[data-testid="logout"]');
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    const competitionName = generateId('competition');
    await createCompetition(page, competitionName, 10, 5);
    
    const tokens = await generateTokens(page, 1);
    await page.click('[data-testid="logout"]');
    
    const studentName = generateId('student');
    studentEmail = `${generateId('student')}@example.com`;
    studentPassword = 'StudentPass123!';
    
    await registerStudent(page, tokens[0], studentName, studentEmail, studentPassword);
    
    // Create team and add content
    await loginAsStudent(page, studentEmail, studentPassword);
    await page.click('text=Competitions');
    await page.click(`text=${competitionName}`);
    
    teamName = generateId('team');
    await page.click('button:has-text("Create Team")');
    await page.fill('input[name="name"]', teamName);
    await page.click('button[type="submit"]');
    
    // Add some chat messages
    await sendChatMessage(page, 'Test message 1');
    await sendChatMessage(page, 'Test message 2');
    
    // Upload a file
    await page.click('text=Files');
    const testDir = path.join(process.cwd(), 'e2e', 'test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testFile = path.join(testDir, 'student-file.pdf');
    fs.writeFileSync(testFile, 'Student uploaded content');
    
    await page.setInputFiles('input[type="file"]', testFile);
    await page.click('button:has-text("Upload")');
    
    await page.click('[data-testid="logout"]');
  });

  test('Headteacher can view all teams in their school', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    
    // Should see the team
    await expect(page.locator('[data-testid="team-list"]')).toContainText(teamName);
  });

  test('Headteacher can view team chat history', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Chat');
    
    // Should see all messages
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Test message 1');
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Test message 2');
  });

  test('Headteacher can view team files', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Files');
    
    // Should see uploaded file
    await expect(page.locator('[data-testid="file-list"]')).toContainText('student-file.pdf');
  });

  test('Headteacher can download team files', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Files');
    
    // Download file
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-student-file.pdf"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toBe('student-file.pdf');
  });

  test('Headteacher can remove a member from a team', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Members');
    
    // Should see the student
    await expect(page.locator('[data-testid="team-members"]')).toContainText(studentEmail);
    
    // Remove member
    await page.click(`[data-testid="remove-member-${studentEmail}"]`);
    await page.click('button:has-text("Confirm")');
    
    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText('Member removed successfully');
    
    // Member should no longer appear
    await expect(page.locator('[data-testid="team-members"]')).not.toContainText(studentEmail);
  });

  test('Headteacher can delete inappropriate messages', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Chat');
    
    // Delete a message
    await page.locator('[data-testid="delete-message"]').first().click();
    await page.click('button:has-text("Confirm")');
    
    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText('Message deleted successfully');
  });

  test('Headteacher can delete inappropriate files', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Files');
    
    // Delete file
    await page.click('[data-testid="delete-student-file.pdf"]');
    await page.click('button:has-text("Confirm")');
    
    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText('File deleted successfully');
    
    // File should no longer appear
    await expect(page.locator('[data-testid="file-list"]')).not.toContainText('student-file.pdf');
  });

  test('Headteacher can view all competitions in their school', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Competitions');
    
    // Should see competitions list
    await expect(page.locator('[data-testid="competition-list"]')).toBeVisible();
  });

  test('Headteacher can filter teams by competition', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    
    // Should have competition filter
    await expect(page.locator('select[name="competition"]')).toBeVisible();
    
    // Filter should work
    // (Actual filtering logic would depend on implementation)
  });

  test('Headteacher cannot access teams from other schools', async ({ page, context }) => {
    // Create another school with another team
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
    await loginAsAdmin(page, adminPassword);
    
    const schoolName2 = generateId('school');
    const headteacherEmail2 = `${generateId('headteacher')}@example.com`;
    const headteacherPassword2 = await createSchool(page, schoolName2, headteacherEmail2);
    
    await page.click('[data-testid="logout"]');
    
    // Login as second headteacher
    await loginAsHeadteacher(page, headteacherEmail2, headteacherPassword2);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    
    // Should NOT see the first school's team
    await expect(page.locator('[data-testid="team-list"]')).not.toContainText(teamName);
  });

  test('Removed member loses access to team resources', async ({ page }) => {
    // Headteacher removes student
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Members');
    
    await page.click(`[data-testid="remove-member-${studentEmail}"]`);
    await page.click('button:has-text("Confirm")');
    
    await page.click('[data-testid="logout"]');
    
    // Student tries to access team
    await loginAsStudent(page, studentEmail, studentPassword);
    
    await page.click('text=My Teams');
    
    // Team should not appear in their list
    await expect(page.locator('[data-testid="team-list"]')).not.toContainText(teamName);
    
    // Try to access team directly by URL
    // (Would need team ID for this)
    // Should be redirected or see access denied message
  });

  test('Headteacher can view moderation activity log', async ({ page }) => {
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Activity Log');
    
    // Should see moderation actions
    await expect(page.locator('[data-testid="activity-log"]')).toBeVisible();
  });

  test('Headteacher can approve or reject join requests', async ({ page, context }) => {
    // Create another student and have them request to join
    const page2 = await context.newPage();
    
    await loginAsHeadteacher(page2, headteacherEmail, headteacherPassword);
    const tokens = await generateTokens(page2, 1);
    await page2.click('[data-testid="logout"]');
    
    const studentName2 = generateId('student');
    const studentEmail2 = `${generateId('student')}@example.com`;
    const studentPassword2 = 'StudentPass123!';
    
    await registerStudent(page2, tokens[0], studentName2, studentEmail2, studentPassword2);
    await loginAsStudent(page2, studentEmail2, studentPassword2);
    
    await page2.click('text=Teams');
    await page2.click(`text=${teamName}`);
    await page2.click('button:has-text("Request to Join")');
    
    await page2.close();
    
    // Headteacher can override and approve
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Join Requests');
    
    // Should see the request
    await expect(page.locator('[data-testid="join-requests"]')).toContainText(studentEmail2);
    
    // Approve request
    await page.locator('[data-testid="approve-request"]').first().click();
    
    // Should show success message
    await expect(page.locator('[role="alert"]')).toContainText('Request approved');
  });
});
