import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Level 10 — AI Copilot flows', () => {
  test('welcome copy and suggested prompts render in the copilot panel', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await expect(page.getByText("Hello! I'm your AI Mail Copilot")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to Sent' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compose email' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unread this week' })).toBeVisible();
  });

  test('NAVIGATE action from AI switches the mailbox folder', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      aiHandler: () => ({ type: 'NAVIGATE', payload: { view: 'SENT' } }),
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Go to Sent' }).click();
    await expect(page.getByRole('heading', { name: 'Sent' })).toBeVisible();
    await expect(page.getByText('Navigated to your sent folder.')).toBeVisible();
  });

  test('OPEN_COMPOSE action opens the compose window', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      aiHandler: () => ({ type: 'OPEN_COMPOSE', payload: {} }),
    });
    await page.goto('/');
    await page.getByPlaceholder('Ask Copilot or type a command...').fill('Compose a new email.');
    await page.getByTitle('Send prompt').click();
    await expect(page.getByText('New Message')).toBeVisible();
    await expect(page.getByText('Compose window opened. Ready for you to write.')).toBeVisible();
  });

  test('FILL_COMPOSE action prefills recipient and subject', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      aiHandler: () => ({
        type: 'FILL_COMPOSE',
        payload: {
          to: 'lead@example.com',
          subject: 'Follow up',
          body: 'Checking in on the timeline.',
        },
      }),
    });
    await page.goto('/');
    await page.getByPlaceholder('Ask Copilot or type a command...').fill('Email lead about the timeline');
    await page.getByTitle('Send prompt').click();
    await expect(page.getByPlaceholder('recipient@example.com')).toHaveValue('lead@example.com');
    await expect(page.getByPlaceholder('Subject line')).toHaveValue('Follow up');
    await expect(page.getByPlaceholder('Write your email here...')).toHaveValue('Checking in on the timeline.');
  });

  test('FILTER_EMAILS unread action applies the unread tab', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      aiHandler: () => ({
        type: 'FILTER_EMAILS',
        payload: { unread: true, dateRange: 'THIS_WEEK' },
      }),
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Unread this week' }).click();
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible();
    await expect(page.getByText('Lunch next week')).toHaveCount(0);
    await expect(page.getByText(/Inbox filtered/)).toBeVisible();
  });

  test('SEARCH_EMAILS action fills the header search box', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      aiHandler: () => ({ type: 'SEARCH_EMAILS', payload: { query: 'Jane' } }),
    });
    await page.goto('/');
    await page.getByPlaceholder('Ask Copilot or type a command...').fill('Find emails from Jane');
    await page.getByTitle('Send prompt').click();
    await expect(page.getByPlaceholder(/Search sender, subject, keywords/)).toHaveValue('Jane');
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible();
  });

  test('OPEN_EMAIL action selects a matching conversation', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      aiHandler: () => ({ type: 'OPEN_EMAIL', payload: { sender: 'John Miller' } }),
    });
    await page.goto('/');
    await page.getByPlaceholder('Ask Copilot or type a command...').fill('Open the email from John');
    await page.getByTitle('Send prompt').click();
    await expect(page.getByRole('heading', { name: 'Lunch next week' })).toBeVisible();
  });

  test('PREPARE_REPLY opens compose addressed to the selected sender', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      aiHandler: () => ({ type: 'PREPARE_REPLY', payload: {} }),
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Draft a reply' }).click();
    await expect(page.getByPlaceholder('recipient@example.com')).toHaveValue('jane.cooper@example.com');
    await expect(page.getByPlaceholder('Subject line')).toHaveValue('Re: Q3 Planning Notes');
  });

  test('AI API failure is shown in the copilot transcript', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.route('**/api/ai/command', async (route) => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        json: { success: false, message: 'Gemini is not configured on the backend', data: null },
      });
    });
    await page.goto('/');
    await page.getByPlaceholder('Ask Copilot or type a command...').fill('Summarize this');
    await page.getByTitle('Send prompt').click();
    await expect(page.getByText('Gemini is not configured on the backend')).toBeVisible();
  });

  test('empty copilot input cannot be submitted', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await expect(page.getByTitle('Send prompt')).toBeDisabled();
  });

  test('live AI command without a Google session is blocked by Spring Security', async ({ request }) => {
    const response = await request.post('http://localhost:8080/api/ai/command', {
      data: {
        message: 'ping',
        context: { currentView: 'INBOX' },
      },
    });
    expect(response.status()).toBe(401);
  });
});
