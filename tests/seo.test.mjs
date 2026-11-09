import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const built = existsSync('dist/index.html');
const pages = () => {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) out.push(p); } };
  walk('dist');
  return out;
};

test('every page has a title and a 50 to 160 character description', { skip: !built }, () => {
  for (const p of pages()) {
    const html = readFileSync(p, 'utf8');
    assert.match(html, /<title>[^<]+<\/title>/, p);
    const d = html.match(/<meta name="description" content="([^"]*)"/);
    assert.ok(d, `${p}: no description`);
    const len = d[1].replace(/&#38;|&amp;/g, '&').length;
    assert.ok(len >= 50 && len <= 160, `${p}: description is ${len} characters`);
  }
});

test('page titles are unique', { skip: !built }, () => {
  const titles = pages().map((p) => readFileSync(p, 'utf8').match(/<title>([^<]+)<\/title>/)[1]);
  assert.equal(new Set(titles).size, titles.length, titles.join(' | '));
});

test('privacy, 404 and sitemap are built', { skip: !built }, () => {
  for (const f of ['dist/privacy/index.html', 'dist/accessibility/index.html', 'dist/404.html', 'dist/sitemap-index.xml']) assert.ok(existsSync(f), f);
});

test('hashed build assets are cached for a year; HTML is not', () => {
  const toml = readFileSync('netlify.toml', 'utf8');
  assert.match(toml, /for = "\/_astro\/\*"[\s\S]*?Cache-Control = "public, max-age=31536000, immutable"/);
  // The site-wide "/*" block must not set Cache-Control (look only inside that block).
  assert.doesNotMatch(toml, /for = "\/\*"(?:(?!\[\[headers\]\])[\s\S])*Cache-Control/);
});
