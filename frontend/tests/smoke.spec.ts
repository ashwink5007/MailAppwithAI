import { test, expect } from '@playwright/test';

test.describe('Level 1 — Smoke', () => {
  test('application loads successfully', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('login page shows brand and primary Google sign-in control', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('AiMail').first()).toBeVisible();
    await expect(page.getByText('Copilot 2.0')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
  });

  test('document title matches the Next.js layout metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AiMail/i);
  });
});
