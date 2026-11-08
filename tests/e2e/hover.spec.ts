import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// A card that lifts on hover must not slide out from under a pointer resting
// near its bottom edge, or it flickers between hovered and not.
test('a hero card stays lifted with the pointer near its bottom edge', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
  const door = page.locator('.door').first();
  const box = (await door.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 2);
  await page.waitForTimeout(700);
  const lifted = await door.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
  expect(lifted).toBeLessThan(-1);
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
