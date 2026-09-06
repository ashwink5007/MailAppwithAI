import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Level 3/11 — Authentication', () => {
  test('Google sign-in is enabled; Microsoft and GitHub are disabled coming-soon controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Microsoft 365/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /GitHub/ })).toBeDisabled();
    await expect(page.getByText('Microsoft 365 and GitHub providers coming in a future sprint.')).toBeVisible();
  });

  test('clicking Continue with Google starts the Spring OAuth redirect to Google', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    await expect(page.getByText('Redirecting to Google…')).toBeVisible();

    await page.waitForURL(/accounts\.google\.com/, { timeout: 20_000 });
    expect(page.url()).toMatch(/accounts\.google\.com/);
    expect(page.url()).toMatch(/gmail\.(readonly|send|modify)/);
  });

  test('backend OAuth start endpoint redirects to Google without requiring a browser login', async ({ request }) => {
    const response = await request.get('http://localhost:8080/oauth2/authorization/google', {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    const location = response.headers()['location'] ?? '';
    expect(location).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2\//);
    expect(location).toContain('redirect_uri=');
    expect(location).not.toContain('client_secret');
  });

  test('unauthenticated GET /api/emails returns 401 JSON instead of an OAuth HTML redirect', async ({ request }) => {
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
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toBeVisible();
  });
});
