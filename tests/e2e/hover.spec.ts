import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// Hover feedback stays in place: the card never moves, its color bar grows
// and its arrow circle fills with the card's color.
test('a hero card responds to hover without moving', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
  const door = page.locator('.door').first();
  const before = (await door.boundingBox())!;
  const barBefore = await door.locator('.bar').evaluate((el) => el.getBoundingClientRect().height);
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.waitForTimeout(700);
  const after = (await door.boundingBox())!;
  expect(Math.abs(after.y - before.y)).toBeLessThan(0.5);
  const barAfter = await door.locator('.bar').evaluate((el) => el.getBoundingClientRect().height);
  expect(barAfter).toBeGreaterThan(barBefore + 2);
  const circBg = await door.locator('.circ').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(circBg).not.toBe('rgba(0, 0, 0, 0)');
});

// Every part of a card should move on the same curve so nothing lurches.
test('card hover parts share one easing curve and a calm duration', async ({ page }) => {
  await page.goto('/');
  const timings = await page.evaluate(() => {
    const pick = (sel: string) => {
      const el = document.querySelector(sel)!;
      const cs = getComputedStyle(el);
      return { sel, fn: cs.transitionTimingFunction, dur: cs.transitionDuration };
    };
    return ['.door', '.door .circ', '.cs .shot img', '.cs .go-lk .circ', '.go-lk .x', '.mc .th img', '.mc .ar2', '.btn .ar'].map(pick);
  });
  for (const t of timings) {
    for (const fn of t.fn.split(/,\s*(?![^(]*\))/)) expect(fn, t.sel).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
    for (const d of t.dur.split(',')) expect(parseFloat(d), t.sel).toBeGreaterThanOrEqual(0.3);
  }
});

test('hover images are on their own layer before the pointer arrives', async ({ page }) => {
  await page.goto('/');
  const wc = await page.locator('.cs .shot img').first().evaluate((el) => getComputedStyle(el).willChange);
  expect(wc).toContain('transform');
});
