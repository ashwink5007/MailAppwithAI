import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Level 3 — UI', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
  });

  test('compose opens, validates recipient, and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Compose' }).click();
    await expect(page.getByText('New Message')).toBeVisible();
    await expect(page.getByPlaceholder('recipient@example.com')).toBeVisible();

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Send' }).click();

    await page.getByRole('button', { name: 'Cc' }).click();
    await expect(page.getByPlaceholder('colleague@example.com')).toBeVisible();
    await page.getByRole('button', { name: 'Bcc' }).click();
    await expect(page.getByPlaceholder('hidden@example.com')).toBeVisible();

    await page.getByTitle('Close').click();
    await expect(page.getByText('New Message')).toHaveCount(0);
  });

  test('search filters the list and empty search state can be cleared', async ({ page }) => {
    await page.getByPlaceholder(/Search sender, subject, keywords/).fill('Lunch');
    await expect(page.getByText('Lunch next week')).toBeVisible();
    await expect(page.getByText('Q3 Planning Notes')).toHaveCount(0);

    await page.getByPlaceholder(/Search sender, subject, keywords/).fill('zzzz-no-match');
    await expect(page.getByText('No emails found')).toBeVisible();
    await page.getByRole('button', { name: 'Clear Search Query' }).click();
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible();
  });

  test('unread / starred / important tabs filter the inbox', async ({ page }) => {
    await page.getByRole('button', { name: 'unread' }).click();
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible();
    await expect(page.getByText('Lunch next week')).toHaveCount(0);

    await page.getByRole('button', { name: 'starred' }).click();
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible();

    await page.getByRole('button', { name: 'important' }).click();
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible();

    await page.getByRole('button', { name: 'all' }).click();
    await expect(page.getByText('Lunch next week')).toBeVisible();
  });

  test('selecting an email shows the thread and AI context banner', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Q3 Planning Notes' })).toBeVisible();
    await page.getByText('Lunch next week').click();
    await expect(page.getByRole('heading', { name: 'Lunch next week' })).toBeVisible();
    await expect(page.getByText('Are you free for lunch on Tuesday?')).toBeVisible();
    await expect(page.getByText('Context: John Miller')).toBeVisible();
  });

  test('AI Copilot panel can be collapsed and reopened', async ({ page }) => {
    await expect(page.getByPlaceholder('Ask Copilot or type a command...')).toBeVisible();
    await page.getByTitle('Collapse Copilot').click();
    await expect(page.getByPlaceholder('Ask Copilot or type a command...')).toHaveCount(0);
    await page.getByRole('button', { name: /AI Copilot/ }).click();
    await expect(page.getByPlaceholder('Ask Copilot or type a command...')).toBeVisible();
  });

  test('notifications menu opens static notification copy', async ({ page }) => {
    await page.getByLabel('Notifications').click();
    await expect(page.getByText('Notifications')).toBeVisible();
    await expect(page.getByText('New unread email from John Miller')).toBeVisible();
  });

  test('inline reply is disabled until text is entered', async ({ page }) => {
    await page.getByRole('button', { name: 'Reply' }).click();
    await expect(page.getByPlaceholder(/Write your reply/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeDisabled();
    await page.getByPlaceholder(/Write your reply/).fill('Thanks, noted.');
    await expect(page.getByRole('button', { name: 'Send' })).toBeEnabled();
  });
});
