import { test, expect } from '@playwright/test';

test.describe.serial('Group, Expense, and Settlement workflows', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Group Tester ${timestamp}`,
    email: `grouptester${timestamp}@example.com`,
    password: 'password123',
  };
  const groupName = `E2E Test Group ${timestamp}`;
  const expenseDesc = `Test Expense ${timestamp}`;

  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('setup: register and login user', async () => {
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

  test('should create a new group', async () => {
    await page.goto('/groups');
    
    // Open create modal
    await page.getByRole('button', { name: /\+ Create group|Create your first group/i }).first().click();
    
    // Fill form
    await page.getByPlaceholder(/Goa Trip/i).fill(groupName);
    await page.getByPlaceholder(/Trip with college friends/i).fill('E2E Description');
    await page.getByRole('button', { name: 'Create group', exact: true }).click();
    
    // Should navigate to group overview
    await expect(page).toHaveURL(/.*\/groups\/[a-zA-Z0-9]+/);
    await expect(page.getByText(groupName)).toBeVisible();
  });

  test('should add a new expense', async () => {
    // Navigate from Overview to Expenses
    await page.getByRole('button', { name: 'Add expense', exact: true }).first().click();
    await page.waitForURL(/.*\/groups\/.*\/expenses/);

    // If the form isn't open, click "+ Add expense"
    const descInput = page.locator('input[name="description"]');
    
    // Playwright is fast, so waitFor might fail if it's genuinely hidden, but we check visibility
    try {
      await descInput.waitFor({ state: 'visible', timeout: 2000 });
    } catch (e) {
      // Not visible, so click + Add expense to open it
      await page.getByRole('button', { name: '+ Add expense' }).click();
    }

    // Fill the expense form
    await descInput.fill(expenseDesc);
    await page.locator('input[name="amount"]').fill('120');
    
    // Submit
    await page.getByRole('button', { name: 'Add expense', exact: true }).click();
    
    // The expense should appear in the list
    await expect(page.getByText(expenseDesc)).toBeVisible();
  });

  test('should render settlement information', async () => {
    // Navigate to settlements using the sidebar or links
    // Assuming there is a link to Settlements
    // Since we don't have another user, balances might be zero or just show ourselves.
    // We will just verify the Settlement UI renders without crashing.
    
    // Click navigation or replace URL
    const url = page.url();
    const settlementUrl = url.replace('/expenses', '/settlements');
    await page.goto(settlementUrl);
    
    await expect(page.getByText(/Record a settlement/i)).toBeVisible();
  });
});
