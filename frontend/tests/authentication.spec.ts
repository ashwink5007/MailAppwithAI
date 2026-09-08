import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

test('email/password sign-in performs one explicit login and confirms the session', async ({ page }) => {
  let sessionEstablished = false;
  let loginRequests = 0;
  let currentUserRequests = 0;

  await page.route('**/api/user/me', async (route) => {
    currentUserRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: sessionEstablished
        ? { id: 42, name: 'QA Tester', email: 'qa.tester@example.com', googleConnected: false, mailboxMode: 'DEMO' }
        : {},
    });
  });
  await page.route('**/auth/login', async (route) => {
    loginRequests += 1;
    sessionEstablished = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true, message: 'Login successful', data: { id: 42 } },
    });
  });
  await page.route('**/api/emails', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true, message: 'Emails retrieved successfully', data: [] },
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByPlaceholder('you@example.com').fill('qa.tester@example.com');
  await page.getByPlaceholder('Min. 8 characters').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/mail$/);
  await expect(page.getByText('qa.tester@example.com').first()).toBeVisible();
  expect(loginRequests).toBe(1);
  // One startup check plus one post-login confirmation; neither is a login.
  expect(currentUserRequests).toBe(2);
});

async function isBackendRunning(request: import('@playwright/test').APIRequestContext): Promise<boolean> {
  try {
    const res = await request.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    return res.ok();
  } catch {
    return false;
  }
}

test.describe('Level 3/11 — Authentication', () => {
  test('Google sign-in is enabled; Microsoft and GitHub are disabled coming-soon controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Microsoft 365/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /GitHub/ })).toBeDisabled();
    await expect(page.getByText('Microsoft 365 and GitHub providers coming in a future sprint.')).toBeVisible();
  });

  test('clicking Continue with Google starts the Spring OAuth redirect to Google', async ({ page, request }) => {
    const backendUp = await isBackendRunning(request);
    test.skip(!backendUp, 'Backend is not running — skipping live OAuth redirect test');

    await page.goto('/');
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    await expect(page.getByText('Redirecting to Google…')).toBeVisible();

    await page.waitForURL(/accounts\.google\.com/, { timeout: 20_000 });
    expect(page.url()).toMatch(/accounts\.google\.com/);
  });

  test('backend OAuth start endpoint redirects to Google without requiring a browser login', async ({ request }) => {
    const backendUp = await isBackendRunning(request);
    test.skip(!backendUp, 'Backend is not running — skipping live OAuth redirect test');

    const response = await request.get(`${BACKEND_URL}/oauth2/authorization/google`, {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    const location = response.headers()['location'] ?? '';
    expect(location).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2\//);
    expect(location).toContain('redirect_uri=');
    expect(location).not.toContain('client_secret');
  });

  test('unauthenticated GET /api/emails returns 401 JSON instead of an OAuth HTML redirect', async ({ request }) => {
    const backendUp = await isBackendRunning(request);
    test.skip(!backendUp, 'Backend is not running — skipping live API test');

    const response = await request.get('/api/emails');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(String(body.message)).toMatch(/not authenticated/i);
  });

  test('mocked session shows the mailbox instead of the login card', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    await expect(page.getByText('qa.tester@example.com').first()).toBeVisible();
  });

  test('sign out returns the user to the login page', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await page.locator('header').getByRole('button').filter({ hasText: 'QA Tester' }).click();
    await page.getByRole('button', { name: 'Sign Out' }).click({ force: true });
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toBeVisible();
  });
});
