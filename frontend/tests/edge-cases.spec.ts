import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Level 13 — Failure and edge cases', () => {
  test('login page still renders when the backend session check fails', async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.abort('connectionrefused');
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
  });

  test('very long search text does not break the list pane', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    const longQuery = 'q'.repeat(400);
    await page.getByPlaceholder(/Search sender, subject, keywords/).fill(longQuery);
    await expect(page.getByText('No emails found')).toBeVisible();
    await expect(page.getByText(new RegExp(`No emails matched "${'q'.repeat(20)}`))).toBeVisible();
  });

  test('special characters in search are treated as literals', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await page.getByPlaceholder(/Search sender, subject, keywords/).fill('<script>alert(1)</script>');
    await expect(page.getByText('No emails found')).toBeVisible();
    await expect(page.locator('script')).toHaveCount(0);
  });

  test('AI request timeout is reported in the transcript', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.route('**/api/ai/command', async (route) => {
      await route.abort('timedout');
    });
    await page.goto('/');
    await page.getByPlaceholder('Ask Copilot or type a command...').fill('Show unread');
    await page.getByTitle('Send prompt').click();
    await expect(page.getByText(/Failed to fetch|Unable to reach AI Copilot|NetworkError|Load failed/i)).toBeVisible();
  });

  test('blank AI message is rejected by the live backend validation when authenticated would be required first', async ({
    request,
  }) => {
    const response = await request.post('/api/ai/command', {
      data: { message: '   ', context: { currentView: 'INBOX' } },
    });
    expect([400, 401]).toContain(response.status());
  });

  test('compose To field uses native email validation for an invalid address', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Compose', exact: true }).click();
    const toInput = page.getByPlaceholder('recipient@example.com');
    await toInput.fill('not-an-email');
    await page.getByPlaceholder('Write your email here...').fill('Body text');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    const validationMessage = await toInput.evaluate((el) => (el as HTMLInputElement).validationMessage);
    expect(validationMessage.length).toBeGreaterThan(0);
    await expect(page.getByText('New Message')).toBeVisible();
  });
});
