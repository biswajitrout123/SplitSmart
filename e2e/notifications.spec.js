import { test, expect } from '@playwright/test';

test.describe.serial('Notification workflow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Notif Tester ${timestamp}`,
    email: `notiftester${timestamp}@example.com`,
    password: 'password123',
  };

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('setup: register and login', async () => {
    // Register
    await page.goto('/register');
    await page.getByPlaceholder(/Test Rout/i).fill(testUser.name);
    await page.getByPlaceholder(/you@example.com/i).fill(testUser.email);
    await page.getByPlaceholder(/At least 6 characters/i).fill(testUser.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForURL(/.*\/login/);

    // Login
    await page.goto('/login');
    await page.getByPlaceholder(/you@example.com/i).fill(testUser.email);
    await page.getByPlaceholder(/Enter your password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/.*\/dashboard/);
  });

  test('should open notification UI', async () => {
    await expect(page.getByText(testUser.name)).toBeVisible();
    
    // Click the notification button
    await page.getByTestId('notification-button').click();
    
    // Verify notification UI loaded
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible();
    
    // Verify it handles empty state correctly
    await expect(page.getByText('No notifications yet.')).toBeVisible();
  });
});
