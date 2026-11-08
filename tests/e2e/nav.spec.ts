import { test, expect } from '@playwright/test';

test.describe('mobile nav at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Menu button opens and Escape closes, returning focus', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('button', { name: 'Menu' });
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#main-nav')).toBeHidden();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    const nav = page.getByRole('navigation', { name: 'Main' });
    for (const name of ['AI agents and integrations', 'Connect.CI platform', 'Case stories', 'Publications']) {
      await expect(nav.getByRole('link', { name })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
  });
});

test.describe('desktop nav at 1280px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Menu button is hidden and links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Case stories' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contact us' })).toBeVisible();
  });
});

test.describe('mobile without JavaScript', () => {
  test.use({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });

  test('nav links are reachable as a row under the logo', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Case stories' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'AI agents and integrations' })).toBeVisible();
  });
});
