# End-to-End Tests

This directory contains comprehensive end-to-end tests for the ProjektOR platform using Playwright.

## Overview

The E2E tests cover all user stories from the feature specification, testing the complete flow from database to UI across:

- Admin functionality
- School/headteacher operations
- Student registration and authentication
- Competition management
- Team creation and collaboration
- Chat functionality
- File hosting
- Moderation features

## Test Files

- **`admin.spec.ts`**: Tests for User Stories 1 & 2 (Admin login and account management)
- **`auth-and-registration.spec.ts`**: Tests for User Stories 3, 4 & 5 (Token generation, student registration, login)
- **`competitions-and-teams.spec.ts`**: Tests for User Stories 6, 7 & 8 (Competition creation, team creation, join requests)
- **`collaboration.spec.ts`**: Tests for User Story 9 (Chat and file hosting)
- **`moderation.spec.ts`**: Tests for User Story 10 (Headteacher moderation)
- **`integration.spec.ts`**: Complete end-to-end integration tests covering entire user journeys
- **`helpers.ts`**: Shared helper functions for all tests

## Running Tests

### Prerequisites

1. Ensure MongoDB is running
2. Create `.env.local` file with required environment variables:
   ```
   MONGO_URI=mongodb://localhost:27017/projektor_test
   ADMIN_PASSWORD=admin_password_123
   API_URL=http://localhost:8000
   ```

### Running All Tests

```bash
pnpm test:e2e
```

### Running Tests in UI Mode

```bash
pnpm test:e2e:ui
```

### Running Tests in Debug Mode

```bash
pnpm test:e2e:debug
```

### Running Tests in Headed Mode (see browser)

```bash
pnpm test:e2e:headed
```

### Running Specific Test Files

```bash
npx playwright test admin.spec.ts
npx playwright test auth-and-registration.spec.ts
npx playwright test integration.spec.ts
```

### Viewing Test Report

```bash
pnpm test:e2e:report
```

## Test Structure

Each test follows this pattern:

1. **Setup**: Create necessary data (schools, users, competitions, etc.)
2. **Action**: Perform the user action being tested
3. **Assertion**: Verify the expected outcome
4. **Cleanup**: Tests are isolated and don't affect each other

## Features Tested

### User Story 1: Admin Login ✅
- [x] Admin can log in with generated password
- [x] Invalid password shows error
- [x] Dashboard is protected

### User Story 2: Admin Account Management ✅
- [x] Create school accounts
- [x] View school details
- [x] Reset user passwords
- [x] Delete user accounts
- [x] Delete school accounts
- [x] Update school information

### User Story 3: School Token Generation ✅
- [x] Headteacher login
- [x] Generate registration tokens
- [x] Copy tokens
- [x] Download tokens as CSV

### User Story 4: Student Registration ✅
- [x] Register with valid token
- [x] Reject invalid tokens
- [x] Reject used tokens
- [x] Email validation
- [x] Password confirmation

### User Story 5: Student Login ✅
- [x] Login and view competitions
- [x] Invalid credentials handling
- [x] Logout functionality

### User Story 6: Competition Creation ✅
- [x] Create school-wide competitions
- [x] Create global competitions
- [x] Display team/member limits
- [x] Edit competitions
- [x] Delete competitions

### User Story 7: Team Creation ✅
- [x] View available competitions
- [x] Create teams
- [x] Prevent duplicate team membership
- [x] Respect team limits

### User Story 8: Join Existing Team ✅
- [x] Request to join team
- [x] View join requests
- [x] Majority approval system
- [x] Reject requests
- [x] Member limit enforcement

### User Story 9: Team Collaboration ✅
- [x] Access team chat
- [x] Send messages
- [x] Real-time updates (WebSocket)
- [x] Chat history persistence
- [x] Upload files (PDF, DOCX, PNG, JPG)
- [x] Download files
- [x] File metadata display
- [x] Storage limit (100MB)
- [x] File type restrictions
- [x] Delete files

### User Story 10: Headteacher Moderation ✅
- [x] View all school teams
- [x] View chat history
- [x] View team files
- [x] Download files
- [x] Remove team members
- [x] Delete messages
- [x] Delete files
- [x] Filter by competition
- [x] School isolation (can't see other schools)
- [x] Override join requests

### Additional Tests ✅
- [x] GDPR compliance (account deletion)
- [x] Performance (concurrent operations)
- [x] Complete integration workflow

## Configuration

Tests are configured in `playwright.config.ts`:

- **Workers**: 1 (tests run sequentially to avoid database conflicts)
- **Retries**: 2 in CI, 0 locally
- **Timeout**: 60 seconds per test
- **Base URL**: http://localhost:8080
- **Screenshots**: Captured on failure
- **Videos**: Retained on failure
- **Traces**: Captured on first retry

## Web Servers

Playwright automatically starts:

1. **Backend**: `pnpm backend:dev` on port 8000
2. **Frontend**: `pnpm start:web` on port 8080

Both servers are started before tests run and shut down after tests complete.

## Test Data

Test data is isolated using:

- Unique timestamps and random IDs
- Separate test database (configured in `.env.local`)
- Automatic cleanup between tests

## Debugging

### View Test in Browser

```bash
pnpm test:e2e:headed
```

### Debug Specific Test

```bash
npx playwright test --debug admin.spec.ts
```

### Inspect Elements

Use Playwright Inspector to step through tests and inspect elements:

```bash
pnpm test:e2e:debug
```

## CI/CD Integration

Tests can be run in CI with:

```bash
CI=true pnpm test:e2e
```

This enables:
- Automatic retries (2 attempts)
- Forbid `.only()` tests
- Fresh server instances

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Unique Data**: Use `generateId()` helper for unique test data
3. **Explicit Waits**: Use `waitForURL()` and `waitFor()` instead of arbitrary timeouts
4. **Data Attributes**: Use `data-testid` attributes for stable selectors
5. **Clean Up**: Tests clean up after themselves
6. **Realistic Data**: Use realistic names and data that match production scenarios

## Troubleshooting

### Tests Failing Locally

1. Check MongoDB is running
2. Verify `.env.local` is configured
3. Ensure ports 8000 and 8080 are available
4. Run `pnpm backend:dev` and `pnpm start:web` manually to check for errors

### Timeout Errors

- Increase timeout in `playwright.config.ts`
- Check backend/frontend are starting correctly
- Look at Playwright traces: `pnpm test:e2e:report`

### Flaky Tests

- Tests run sequentially (workers: 1) to avoid race conditions
- Add explicit waits for dynamic content
- Check WebSocket connections are stable

## Contributing

When adding new features:

1. Add corresponding E2E tests
2. Follow existing test structure
3. Use helper functions from `helpers.ts`
4. Add new helpers for reusable operations
5. Update this README with new test coverage
