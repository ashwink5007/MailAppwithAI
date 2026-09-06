import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Level 5 — End-to-end mailbox flows', () => {
  test('open app → mocked auth → load inbox → open email → reply', async ({ page }) => {
    let replyPayload: Record<string, unknown> | null = null;
    await mockAuthenticatedSession(page);
    await page.route(/\/api\/emails\/msg-inbox-1\/reply$/, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      replyPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { success: true, message: 'Reply sent successfully', data: 'gmail-reply-1' },
      });
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Q3 Planning Notes' })).toBeVisible();
    await page.getByRole('button', { name: 'Reply', exact: true }).click();
    await page.getByPlaceholder(/Write your reply/).fill('I reviewed the agenda.');
    await page.getByRole('button', { name: 'Send', exact: true }).click();

    await expect.poll(() => replyPayload).toEqual({ body: 'I reviewed the agenda.' });
    await expect(page.getByPlaceholder(/Write your reply/)).toHaveCount(0);
  });

  test('compose a new message and send it through the intercepted send API', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Compose', exact: true }).click();
    await page.getByPlaceholder('recipient@example.com').fill('ops@example.com');
    await page.getByPlaceholder('Subject line').fill('Status update');
    await page.getByPlaceholder('Write your email here...').fill('All tests are running.');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByText('New Message')).toHaveCount(0);
  });

  test('Promotions label and Sent folder keep independent lists', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Promotions' }).click();
    await expect(page.getByRole('heading', { name: 'Label: Promotions' })).toBeVisible();
    await expect(page.getByText('50% off this weekend')).toBeVisible();
    await expect(page.getByText('Lunch next week')).toHaveCount(0);

    await page.getByRole('button', { name: /^Sent/ }).click();
    await expect(page.getByRole('heading', { name: 'Sent' })).toBeVisible();
    await expect(page.getByText('Re: Q3 Planning Notes')).toBeVisible();
  });
});
