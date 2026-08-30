import { test, expect } from '@playwright/test';

test.describe.serial('Authentication and Registration', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    password: 'password123',
  };

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should register a new user successfully', async () => {
    await page.goto('/register');
    
    // Validate required fields by submitting empty
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Please enter your name')).toBeVisible();
    
    await page.getByPlaceholder(/Test Rout/i).fill(testUser.name);
    await page.getByPlaceholder(/you@example.com/i).fill(testUser.email);
    await page.getByPlaceholder(/At least 6 characters/i).fill(testUser.password);
    
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify successful navigation to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should login successfully', async () => {
    // Navigate and login
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testUser.email);
    await page.getByPlaceholder(/Enter your password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify protected UI is visible (Dashboard)
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should block unauthenticated users from protected routes', async () => {
    // Clear context (cookies, etc) to ensure unauthenticated state
    await page.context().clearCookies();
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
