import { test, expect } from '@playwright/test';

test('content already on screen at load finishes fading in quickly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('/services/ai-agents/');
  await page.waitForTimeout(1600);
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.rv')]
    .filter((e) => e.getBoundingClientRect().top < innerHeight && getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
});

test('people who ask for reduced motion get no hiding at all', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/\bmo\b/);
});
