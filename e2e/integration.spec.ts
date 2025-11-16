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

/**
 * Integration test that covers the complete user journey
 * from admin setup to student collaboration
 */
test.describe('Complete User Journey: End-to-End Integration', () => {
  test('Complete workflow from admin to student collaboration', async ({ page, context }) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
    
    // ==========================================
    // STEP 1: Admin creates a school
    // ==========================================
    console.log('STEP 1: Admin login and school creation');
    
    await loginAsAdmin(page, adminPassword);
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    const schoolName = `Integration School ${Date.now()}`;
    const headteacherEmail = `headteacher_${Date.now()}@school.edu`;
    
    await page.click('text=Schools');
    await page.click('button:has-text("Create School")');
    await page.fill('input[name="name"]', schoolName);
    await page.fill('input[name="email"]', headteacherEmail);
    await page.click('button[type="submit"]');
    
    const headteacherPassword = await page.locator('[data-testid="generated-password"]').textContent();
    expect(headteacherPassword).toBeTruthy();
    console.log(`✅ School created with email: ${headteacherEmail}`);
    
    await page.click('[data-testid="logout"]');
    
    // ==========================================
    // STEP 2: Headteacher creates competition and generates tokens
    // ==========================================
    console.log('STEP 2: Headteacher login and setup');
    
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword!);
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Create competition
    const competitionName = `Science Fair ${Date.now()}`;
    await page.click('text=Competitions');
    await page.click('button:has-text("Create Competition")');
    await page.fill('input[name="name"]', competitionName);
    await page.fill('input[name="description"]', 'Annual Science Fair Competition');
    await page.fill('input[name="maxTeams"]', '10');
    await page.fill('input[name="maxMembers"]', '4');
    await page.selectOption('select[name="scope"]', 'school');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toContainText('Competition created successfully');
    console.log(`✅ Competition created: ${competitionName}`);
    
    // Generate registration tokens
    await page.click('text=Tokens');
    await page.fill('input[name="count"]', '3');
    await page.click('button:has-text("Generate")');
    
    const tokenElements = await page.locator('[data-testid="token"]').all();
    const tokens: string[] = [];
    for (const element of tokenElements) {
      const token = await element.textContent();
      if (token) tokens.push(token);
    }
    
    expect(tokens.length).toBe(3);
    console.log(`✅ Generated ${tokens.length} registration tokens`);
    
    await page.click('[data-testid="logout"]');
    
    // ==========================================
    // STEP 3: Three students register
    // ==========================================
    console.log('STEP 3: Student registration');
    
    const students = [
      {
        name: `Alice Student ${Date.now()}`,
        email: `alice_${Date.now()}@student.edu`,
        password: 'AlicePass123!',
        token: tokens[0],
      },
      {
        name: `Bob Student ${Date.now()}`,
        email: `bob_${Date.now()}@student.edu`,
        password: 'BobPass123!',
        token: tokens[1],
      },
      {
        name: `Charlie Student ${Date.now()}`,
        email: `charlie_${Date.now()}@student.edu`,
        password: 'CharliePass123!',
        token: tokens[2],
      },
    ];
    
    for (const student of students) {
      await registerStudent(page, student.token, student.name, student.email, student.password);
      await expect(page.locator('[role="alert"]')).toContainText('Registration successful');
      console.log(`✅ Registered student: ${student.email}`);
    }
    
    // ==========================================
    // STEP 4: Alice creates a team
    // ==========================================
    console.log('STEP 4: Team creation');
    
    await loginAsStudent(page, students[0].email, students[0].password);
    
    await page.click('text=Competitions');
    await expect(page.locator(`text=${competitionName}`)).toBeVisible();
    
    await page.click(`text=${competitionName}`);
    
    const teamName = `Innovators Team ${Date.now()}`;
    await page.click('button:has-text("Create Team")');
    await page.fill('input[name="name"]', teamName);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toContainText('Team created successfully');
    console.log(`✅ Team created: ${teamName}`);
    
    await page.click('[data-testid="logout"]');
    
    // ==========================================
    // STEP 5: Bob requests to join the team
    // ==========================================
    console.log('STEP 5: Join request workflow');
    
    await loginAsStudent(page, students[1].email, students[1].password);
    
    await page.click('text=Teams');
    await page.click(`text=${teamName}`);
    await page.click('button:has-text("Request to Join")');
    
    await expect(page.locator('[role="alert"]')).toContainText('Join request sent');
    console.log(`✅ Bob sent join request`);
    
    await page.click('[data-testid="logout"]');
    
    // ==========================================
    // STEP 6: Alice approves Bob's request
    // ==========================================
    console.log('STEP 6: Approving join request');
    
    await loginAsStudent(page, students[0].email, students[0].password);
    
    await page.click('text=My Teams');
    await page.click(`text=${teamName}`);
    
    await expect(page.locator('text=Join Requests')).toBeVisible();
    await page.locator('[data-testid="approve-request"]').first().click();
    
    await expect(page.locator('[role="alert"]')).toContainText('Request approved');
    await expect(page.locator('[data-testid="team-members"]')).toContainText(students[1].email);
    console.log(`✅ Bob approved and added to team`);
    
    // ==========================================
    // STEP 7: Team collaboration - Chat
    // ==========================================
    console.log('STEP 7: Team collaboration - Chat');
    
    await sendChatMessage(page, 'Hello team! Let\'s discuss our project.');
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Hello team!');
    console.log(`✅ Alice sent a chat message`);
    
    await page.click('[data-testid="logout"]');
    
    // Bob logs in and replies
    await loginAsStudent(page, students[1].email, students[1].password);
    await page.click('text=My Teams');
    await page.click(`text=${teamName}`);
    
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Hello team!');
    await sendChatMessage(page, 'Great! I have some ideas.');
    
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Great! I have some ideas.');
    console.log(`✅ Bob replied to chat`);
    
    // ==========================================
    // STEP 8: Team collaboration - File upload
    // ==========================================
    console.log('STEP 8: Team collaboration - Files');
    
    await page.click('text=Files');
    
    const testDir = path.join(process.cwd(), 'e2e', 'test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const projectFile = path.join(testDir, 'project-proposal.pdf');
    fs.writeFileSync(projectFile, 'Science Fair Project Proposal Content');
    
    await page.setInputFiles('input[type="file"]', projectFile);
    await page.click('button:has-text("Upload")');
    
    await expect(page.locator('[role="alert"]')).toContainText('File uploaded successfully');
    await expect(page.locator('[data-testid="file-list"]')).toContainText('project-proposal.pdf');
    console.log(`✅ Bob uploaded a file`);
    
    await page.click('[data-testid="logout"]');
    
    // Alice can see the file
    await loginAsStudent(page, students[0].email, students[0].password);
    await page.click('text=My Teams');
    await page.click(`text=${teamName}`);
    await page.click('text=Files');
    
    await expect(page.locator('[data-testid="file-list"]')).toContainText('project-proposal.pdf');
    console.log(`✅ Alice can see Bob's uploaded file`);
    
    await page.click('[data-testid="logout"]');
    
    // ==========================================
    // STEP 9: Headteacher moderation
    // ==========================================
    console.log('STEP 9: Headteacher moderation');
    
    await loginAsHeadteacher(page, headteacherEmail, headteacherPassword!);
    
    await page.click('text=Moderation');
    await page.click('text=Teams');
    await expect(page.locator('[data-testid="team-list"]')).toContainText(teamName);
    
    await page.click(`text=${teamName}`);
    await page.click('text=Chat');
    
    // Should see all messages
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Hello team!');
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('Great! I have some ideas.');
    console.log(`✅ Headteacher can view chat history`);
    
    await page.click('text=Files');
    await expect(page.locator('[data-testid="file-list"]')).toContainText('project-proposal.pdf');
    console.log(`✅ Headteacher can view uploaded files`);
    
    await page.click('text=Members');
    await expect(page.locator('[data-testid="team-members"]')).toContainText(students[0].email);
    await expect(page.locator('[data-testid="team-members"]')).toContainText(students[1].email);
    console.log(`✅ Headteacher can view team members`);
    
    await page.click('[data-testid="logout"]');
    
    // ==========================================
    // STEP 10: Admin reviews everything
    // ==========================================
    console.log('STEP 10: Admin overview');
    
    await loginAsAdmin(page, adminPassword);
    
    await page.click('text=Schools');
    await expect(page.locator(`text=${schoolName}`)).toBeVisible();
    
    await page.click('text=Users');
    // Should see all registered students
    const usersList = await page.locator('[data-testid="user-list"]').textContent();
    expect(usersList).toContain(students[0].email);
    expect(usersList).toContain(students[1].email);
    console.log(`✅ Admin can see all users`);
    
    await page.click('[data-testid="logout"]');
    
    console.log('🎉 COMPLETE INTEGRATION TEST PASSED!');
  });

  test('GDPR compliance: User can delete their own account', async ({ page }) => {
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
    const studentEmail = `${generateId('student')}@example.com`;
    const studentPassword = 'StudentPass123!';
    
    await registerStudent(page, tokens[0], studentName, studentEmail, studentPassword);
    await loginAsStudent(page, studentEmail, studentPassword);
    
    // Navigate to account settings
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Account Settings');
    
    // Delete account
    await page.click('button:has-text("Delete Account")');
    await page.fill('input[name="confirmPassword"]', studentPassword);
    await page.click('button:has-text("Confirm Deletion")');
    
    // Should show confirmation
    await expect(page.locator('[role="alert"]')).toContainText('Account deleted successfully');
    
    // Should be logged out
    await page.waitForURL('/');
    
    // Try to login - should fail
    await page.goto('/login');
    await page.fill('input[name="email"]', studentEmail);
    await page.fill('input[name="password"]', studentPassword);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials');
    
    console.log('✅ GDPR: User successfully deleted their account');
  });

  test('Performance: Platform handles multiple concurrent operations', async ({ page, context }) => {
    // This test simulates multiple users performing actions simultaneously
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_123';
    
    await loginAsAdmin(page, adminPassword);
    
    const schoolName = generateId('school');
    const schoolEmail = `${generateId('headteacher')}@example.com`;
    const schoolPassword = await createSchool(page, schoolName, schoolEmail);
    
    await page.click('[data-testid="logout"]');
    await loginAsHeadteacher(page, schoolEmail, schoolPassword);
    
    const competitionName = generateId('competition');
    await createCompetition(page, competitionName, 20, 5);
    
    const tokens = await generateTokens(page, 5);
    await page.click('[data-testid="logout"]');
    
    // Register 5 students concurrently
    const studentPromises = tokens.map(async (token, index) => {
      const studentPage = await context.newPage();
      const studentName = `Student ${index}`;
      const studentEmail = `student${index}_${Date.now()}@example.com`;
      const studentPassword = 'StudentPass123!';
      
      await registerStudent(studentPage, token, studentName, studentEmail, studentPassword);
      await loginAsStudent(studentPage, studentEmail, studentPassword);
      
      // Each student creates a team
      await studentPage.click('text=Competitions');
      await studentPage.click(`text=${competitionName}`);
      await studentPage.click('button:has-text("Create Team")');
      await studentPage.fill('input[name="name"]', `Team ${index}`);
      await studentPage.click('button[type="submit"]');
      
      await expect(studentPage.locator('[role="alert"]')).toContainText('Team created successfully');
      
      await studentPage.close();
    });
    
    const startTime = Date.now();
    await Promise.all(studentPromises);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    console.log(`✅ 5 concurrent user operations completed in ${duration}ms`);
    
    // Verify all teams were created
    await loginAsHeadteacher(page, schoolEmail, schoolPassword);
    await page.click('text=Moderation');
    await page.click('text=Teams');
    
    const teamsList = await page.locator('[data-testid="team-list"]').textContent();
    expect(teamsList).toContain('Team 0');
    expect(teamsList).toContain('Team 4');
    
    console.log('✅ Performance test: All concurrent operations succeeded');
  });
});
