import { test, expect } from '@playwright/test';
import { mockAuthenticatedSession } from './helpers/auth';

test.describe('Level 2 — Navigation', () => {
  test('root route renders the unauthenticated login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toBeVisible();
  });

  test('unknown route shows Next.js not-found content rather than the mailbox', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toHaveCount(0);
    await expect(page.getByText(/404|This page could not be found/i)).toBeVisible();
  });

  test('/todos is a real App Router page and currently returns a server error', async ({ request }) => {
    const response = await request.get('/todos');
    expect([404, 500]).toContain(response.status());
  });

  test('authenticated workspace can switch mailbox folders', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
    await page.getByRole('button', { name: /^Sent/ }).click();
    await expect(page.getByRole('heading', { name: 'Sent' })).toBeVisible();
    await expect(page.getByText('Re: Q3 Planning Notes')).toBeVisible();

    await page.getByRole('button', { name: /^Starred/ }).click();
    await expect(page.getByRole('heading', { name: 'Starred' })).toBeVisible();

    await page.getByRole('button', { name: /^Trash/ }).click();
    await expect(page.getByRole('heading', { name: 'Trash' })).toBeVisible();
    await expect(page.getByText('No emails found')).toBeVisible();
  });

  test('label filters update the list heading', async ({ page }) => {
    await mockAuthenticatedSession(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Work' }).click();
    await expect(page.getByRole('heading', { name: 'Label: Work' })).toBeVisible();
    await expect(page.getByText('Q3 Planning Notes')).toBeVisible();
    await expect(page.getByText('Lunch next week')).toHaveCount(0);
  });

  test('browser back returns from a 404 to the login page', async ({ page }) => {
    await page.goto('/');
    await page.goto('/this-route-does-not-exist');
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Sign In to AiMail' })).toBeVisible();
  });
});
