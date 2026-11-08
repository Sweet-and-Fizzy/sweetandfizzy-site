import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const built = existsSync('dist/index.html');
const read = (p) => readFileSync(p, 'utf8');
const pages = () => { const out = []; const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) out.push(p); } }; walk('dist'); return out; };
const text = (h) => h.replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/g, ' $1 ').replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&amp;|&#38;/g, '&').replace(/\s+/g, ' ').trim();

test('contact form starts with a neutral audience choice', { skip: !built }, () => {
  const sel = read('dist/contact/index.html').match(/<select[^>]*name="audience"[\s\S]*?<\/select>/)[0];
  assert.match(sel, /<option value(="")?[^>]*>Choose one<\/option>/);
});

test('live project tiles on the homepage link to their sites', { skip: !built }, () => {
  const h = read('dist/index.html');
  for (const url of ['https://aroundhere.live', 'https://mollybburnham.com', 'https://readingsuccesslab.com', 'https://www.emilydickinsonmuseum.org/homestead-parlors/'])
    assert.match(h, new RegExp(`<a[^>]*href="${url.replace(/[.?/]/g, '\\$&')}"`), url);
});

test('case study figures open their full-size image', { skip: !built }, () => {
  for (const s of ['access-support', 'access-ai-assistant', 'open-ondemand', 'mghpcc']) {
    const h = read(`dist/work/${s}/index.html`);
    for (const fig of h.match(/<figure class="ch-fig"[\s\S]*?<\/figure>/g) || []) {
      if (!/<img/.test(fig)) continue;
      assert.match(fig, /<a[^>]*href="\/_astro\/[^"]+"[^>]*>[\s\S]*<img/, `${s}: figure image not linked`);
    }
  }
});

test('no page serves a GIF', { skip: !built }, () => {
  for (const p of pages()) assert.equal(/\.gif"/.test(read(p)), false, p);
});

test('Connect.CI help items are real headings', { skip: !built }, () => {
  const h = read('dist/connect-ci/index.html');
  for (const t of ['Coordinator training', 'Moderation help', 'Onboarding', 'Engagement reporting']) assert.match(h, new RegExp(`<h4[^>]*>${t}</h4>`), t);
});

test('in main content, the same link text always goes to the same place', { skip: !built }, () => {
  for (const p of pages()) {
    const main = (read(p).match(/<main[\s\S]*<\/main>/) || [''])[0];
    const seen = new Map();
    for (const [, href, inner] of main.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const t = text(inner); if (!t) continue;
      if (seen.has(t) && seen.get(t) !== href) assert.fail(`${p}: "${t}" -> ${seen.get(t)} and ${href}`);
      seen.set(t, href);
    }
  }
});
