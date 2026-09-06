import { Page } from '@playwright/test';
import { mockUser, sampleEmails } from './fixtures';

interface MockOptions {
  emails?: unknown[];
  emailsDelayMs?: number;
  emailsError?: { status: number; message: string };
  emailsInvalidBody?: string;
  aiHandler?: (message: string) => unknown;
}

export async function mockAuthenticatedSession(page: Page, options: MockOptions = {}) {
  await page.route('**/api/user/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: mockUser,
    });
  });

  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        message: 'Backend is running',
        data: { status: 'UP', service: 'mailapp-backend', sprint: '3.1' },
      },
    });
  });

  await page.route(/\/api\/emails\/send$/, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    const payload = route.request().postDataJSON() as { to?: string; body?: string };
    if (!payload?.to || !payload?.body) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        json: { success: false, message: 'Invalid request', data: null },
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true, message: 'Email sent successfully', data: 'gmail-sent-1' },
    });
  });

  await page.route(/\/api\/emails\/[^/]+\/reply$/, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true, message: 'Reply sent successfully', data: 'gmail-reply-1' },
    });
  });

  await page.route(/\/api\/emails\/[^/]+\/read$/, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true, message: 'Email marked as read', data: null },
    });
  });

  await page.route(/\/api\/emails\/[^/]+$/, async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { success: true, message: 'Email moved to trash', data: null },
      });
      return;
    }
    await route.fallback();
  });

  await page.route(/\/api\/emails$/, async (route) => {
    if (options.emailsDelayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.emailsDelayMs));
    }
    if (options.emailsInvalidBody !== undefined) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: options.emailsInvalidBody,
      });
      return;
    }
    if (options.emailsError) {
      await route.fulfill({
        status: options.emailsError.status,
        contentType: 'application/json',
        json: {
          success: false,
          message: options.emailsError.message,
          data: null,
        },
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        message: 'Emails retrieved successfully',
        data: options.emails ?? sampleEmails,
      },
    });
  });

  await page.route('**/api/ai/command', async (route) => {
    const payload = route.request().postDataJSON() as { message?: string };
    const message = payload?.message ?? '';
    const action = options.aiHandler
      ? options.aiHandler(message)
      : { type: 'UNKNOWN', payload: { reason: 'Mocked AI response' } };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        message: 'AI command interpreted successfully',
        data: { action },
      },
    });
  });

  await page.route('**/logout', async (route) => {
    await route.fulfill({ status: 200, body: 'ok' });
  });

  await page.route('**/copilotkit/**', async (route) => {
    await route.fulfill({
      status: 501,
      contentType: 'application/json',
      json: { error: 'CopilotKit not configured' },
    });
  });
}
