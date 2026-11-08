import { test, expect } from '@playwright/test';

test('audience from the link is preselected and proposal shows the deadline field', async ({ page }) => {
  await page.goto('/contact/?audience=program');
  const select = page.getByLabel('What are you working on?');
  await expect(select).toHaveValue('program');
  await expect(page.getByLabel('Proposal deadline')).toBeHidden();
  await select.selectOption('proposal');
  await expect(page.getByLabel('Proposal deadline')).toBeVisible();
});

test('a successful send shows thanks and pushes one lead event', async ({ page }) => {
  await page.route('**/', (route) => route.request().method() === 'POST' ? route.fulfill({ status: 200, body: 'ok' }) : route.continue());
  await page.goto('/contact/?audience=proposal');
  await page.getByLabel('Name', { exact: true }).fill('Ada');
  await page.getByLabel('Email', { exact: true }).fill('ada@example.org');
  await page.getByLabel('Institution or organization').fill('Example U');
  await page.getByLabel('A few lines about it').fill('A CSSI proposal.');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Lissie or Andrew will reply within two days.').last()).toBeVisible();
  await expect(page.getByRole('link', { name: /book a call/i })).toHaveCount(0);
  const leads = await page.evaluate(() => (window as any).dataLayer.filter((e: any) => e.event === 'generate_lead'));
  expect(leads).toEqual([{ event: 'generate_lead', lead_source: 'proposal' }]);
});

test('a failed send shows the error and moves focus to it', async ({ page }) => {
  await page.route('**/', (route) => route.request().method() === 'POST' ? route.fulfill({ status: 500 }) : route.continue());
  await page.goto('/contact/?audience=website');
  await page.getByLabel('Name', { exact: true }).fill('Ada');
  await page.getByLabel('Email', { exact: true }).fill('ada@example.org');
  await page.getByLabel('A few lines about it').fill('A new site.');
  await page.getByRole('button', { name: 'Send' }).click();
  const err = page.getByRole('alert');
  await expect(err).toContainText('That did not send');
  await expect(err).toBeFocused();
});

test('Google Tag Manager does not load off the production domain', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
});
