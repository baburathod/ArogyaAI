import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test('redirects unauthenticated dashboard access to login', async ({ page }) => {
    await page.goto('/dashboard/patient');
    await expect(page).toHaveURL(/\/auth\/login(\?|$)/);
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByText(/Access ArogyaAI securely/i)).toBeVisible();
  });

  test('redirects unauthenticated body map access to login', async ({ page }) => {
    await page.goto('/body-map');
    await expect(page).toHaveURL(/\/auth\/login(\?|$)/);
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByText(/Access ArogyaAI securely/i)).toBeVisible();
  });

  test('retains offline queue data while offline', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.getByText(/Welcome to ArogyaAI/i)).toBeVisible();

    await page.evaluate(() => {
      const queue = [
        {
          type: 'medication-taken',
          payload: {
            medId: 'm-e2e-1',
            name: 'E2E Test Medication',
            takenAt: new Date().toISOString(),
          },
        },
      ];
      localStorage.setItem('offlineQueue', JSON.stringify(queue));
    });

    await context.setOffline(true);
    await expect(page.getByText(/Welcome to ArogyaAI/i)).toBeVisible();
    await context.setOffline(false);

    const stored = await page.evaluate(() => localStorage.getItem('offlineQueue'));
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored || '[]')).toHaveLength(1);
  });
});
