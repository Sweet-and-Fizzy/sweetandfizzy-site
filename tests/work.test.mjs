import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const slugs = ['access-support', 'access-ai-assistant', 'open-ondemand', 'mghpcc'];
const page = (s) => `dist/work/${s}/index.html`;
const built = existsSync('dist/index.html');

test('each Phase 1 case study page is built', { skip: !built }, () => {
  for (const s of slugs) assert.ok(existsSync(page(s)), `missing ${page(s)}`);
});

test('a case study with no quote renders no quote block', { skip: !built }, () => {
  const html = readFileSync(page('access-ai-assistant'), 'utf8');
  assert.equal(/class="tq"/.test(html), false);
});

test('a figure with no image renders the labelled placeholder, never an empty img', { skip: !built }, () => {
  const html = readFileSync(page('access-support'), 'utf8');
  assert.match(html, /class="ph"/);
  for (const s of slugs) assert.equal(/<img[^>]*src=""/.test(readFileSync(page(s), 'utf8')), false, s);
});

test('case pages link to each other with site routes, not board files', { skip: !built }, () => {
  for (const s of slugs) assert.equal(/\.dc\.html/.test(readFileSync(page(s), 'utf8')), false, s);
});

test('every case study image has alt text', { skip: !built }, () => {
  for (const s of slugs) {
    const html = readFileSync(page(s), 'utf8');
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) assert.match(tag, /alt="[^"]*"/, `${s}: ${tag}`);
  }
});

test('case stories landing lists exactly the four Phase 1 case studies in order', { skip: !built }, () => {
  const html = readFileSync('dist/work/index.html', 'utf8');
  const hrefs = [...html.matchAll(/<a class="cs[^"]*" href="(\/work\/[^"]+\/)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, slugs.map((s) => `/work/${s}/`));
});
