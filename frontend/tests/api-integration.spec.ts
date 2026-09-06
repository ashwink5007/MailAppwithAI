import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Level 4 — API integration (frontend behavior)', () => {
  test('successful mailbox load maps backend emails into the list and detail pane', async ({ page }) => {
    const mailboxRequests: string[] = [];
    await mockAuthenticatedSession(page);
    page.on('request', (request) => {
      if (request.url().includes('/api/emails')) {
        mailboxRequests.push(`${request.method()} ${new URL(request.url()).pathname}`);
      }
    });

    await page.goto('/');
    await expect(page.getByText('Jane Cooper').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Q3 Planning Notes' })).toBeVisible();
    expect(mailboxRequests.some((item) => item === 'GET /api/emails')).toBeTruthy();
  });

  test('empty mailbox shows the empty state instead of crashing', async ({ page }) => {
    await mockAuthenticatedSession(page, { emails: [] });
    await page.goto('/');
    await expect(page.getByText('No emails found')).toBeVisible();
    await expect(page.getByText('This mailbox is currently clean and empty.')).toBeVisible();
    await expect(page.getByText('Select an email to view')).toBeVisible();
  });

  test('email API error shows the retryable error state', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      emailsError: { status: 500, message: 'Gmail API unavailable' },
    });
    await page.goto('/');
    await expect(page.getByText('Unable to load emails')).toBeVisible();
    await expect(page.getByText('Gmail API unavailable')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('unauthorized mailbox response is surfaced in the UI', async ({ page }) => {
    await mockAuthenticatedSession(page, {
      emailsError: {
        status: 401,
        message: 'Not authenticated. Please login via Google OAuth.',
      },
    });
    await page.goto('/');
    await expect(page.getByText('Unable to load emails')).toBeVisible();
    await expect(page.getByText(/Not authenticated/)).toBeVisible();
  });

  test('invalid JSON from the mailbox API is handled without a blank crash', async ({ page }) => {
    await mockAuthenticatedSession(page, { emailsInvalidBody: '<html>nope</html>' });
    await page.goto('/');
    await expect(page.getByText('Unable to load emails')).toBeVisible();
  });

  test('slow mailbox response shows the loading state first', async ({ page }) => {
    await mockAuthenticatedSession(page, { emailsDelayMs: 1500 });
    await page.goto('/');
    await expect(page.getByText('Loading emails...')).toBeVisible();
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible({ timeout: 15_000 });
  });

  test('compose send posts /api/emails/send with the form payload', async ({ page }) => {
    let sendPayload: Record<string, unknown> | null = null;
    await mockAuthenticatedSession(page);
    await page.route(/\/api\/emails\/send$/, async (route) => {
      sendPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { success: true, message: 'Email sent successfully', data: 'gmail-sent-1' },
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Compose' }).click();
    await page.getByPlaceholder('recipient@example.com').fill('teammate@example.com');
    await page.getByPlaceholder('Subject line').fill('Playwright send check');
    await page.getByPlaceholder('Write your email here...').fill('Hello from the QA suite.');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect.poll(() => sendPayload).not.toBeNull();
    expect(sendPayload).toMatchObject({
      to: 'teammate@example.com',
      subject: 'Playwright send check',
      body: 'Hello from the QA suite.',
    });
    await expect(page.getByText('New Message')).toHaveCount(0);
  });

  test('empty compose body is rejected by the backend contract (400 Invalid request)', async ({ page }) => {
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toMatch(/Invalid request|Failed to send/i);
      void dialog.accept();
    });

    await mockAuthenticatedSession(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Compose' }).click();
    await page.getByPlaceholder('recipient@example.com').fill('teammate@example.com');
    await page.getByPlaceholder('Subject line').fill('Missing body');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('New Message')).toBeVisible();
  });
});

test.describe('Level 4 — Live backend API (no mailbox mutation)', () => {
  test('health endpoint is reachable through the Next.js proxy', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('UP');
    expect(body.data.service).toBe('mailapp-backend');
  });

  test('health endpoint is reachable on the backend origin', async ({ request }) => {
    const response = await request.get('http://localhost:8080/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('unauthenticated /api/user/me returns an empty object with HTTP 200', async ({ request }) => {
    const response = await request.get('/api/user/me');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({});
  });

  test('unauthenticated AI command is rejected', async ({ request }) => {
    const response = await request.post('/api/ai/command', {
      data: {
        message: 'Show unread emails from this week',
        context: { currentView: 'INBOX' },
      },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});
