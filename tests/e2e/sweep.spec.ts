import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { builtPages } from './pages';

const widths = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const path of builtPages()) {
  for (const vp of widths) {
    test.describe(`${path} @ ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('has no WCAG 2.2 AA axe violations', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 5).join(', ')}`);
        expect(summary).toEqual([]);
      });

      test('does not scroll sideways', async ({ page }) => {
        await page.goto(path);
        const [scroll, inner] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        expect(scroll).toBeLessThanOrEqual(inner);
      });

      test('interactive targets are at least 44px or inline text', async ({ page }) => {
        await page.goto(path);
        const small = await page.evaluate(() => {
          const out: string[] = [];
          for (const el of document.querySelectorAll<HTMLElement>('a, button, input, select, textarea, summary')) {
            const r = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            if (r.width === 0 || r.height === 0 || style.visibility === 'hidden') continue;
            if (el.closest('p, li > span, td, figcaption, .skip') && style.display === 'inline') continue;
            if (el.classList.contains('sr-only') || el.getAttribute('tabindex') === '-1') continue;
            if (r.width < 44 || r.height < 44) out.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
          }
          return out;
        });
        expect(small).toEqual([]);
      });
    });
  }

  test.describe(`${path} without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });
    test('keeps all main content visible', async ({ page }) => {
      await page.goto(path);
      // CSS entrance animations still run without JS; wait for them to end.
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll('main *')].filter((el) => getComputedStyle(el).opacity === '0').length);
      expect(hidden).toBe(0);
    });
  });
}
