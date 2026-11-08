import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { findPlaceholders, findBrokenLinks } from '../scripts/check-dist.mjs';

test('findPlaceholders returns bracketed capitalised placeholders', () => {
  assert.deepEqual(findPlaceholders('<p>[CITY] and [N%]</p>'), ['[CITY]', '[N%]']);
});

test('findPlaceholders ignores code, scripts, lowercase and markdown links', () => {
  assert.deepEqual(findPlaceholders('<code>arr[0]</code> <script>a["X"]</script> [link](x) [lower case]'), []);
});

test('findBrokenLinks reports internal hrefs with no built page', () => {
  assert.deepEqual(findBrokenLinks(new Map([['index.html', '<a href="/work/">']])), [{ file: 'index.html', href: '/work/' }]);
});

test('findBrokenLinks accepts built pages and ignores external, mailto and hash links', () => {
  const files = new Map([
    ['index.html', '<a href="/work/"><a href="/work/#x"><a href="https://x.org"><a href="mailto:a@b.c"><a href="#top"><a href="/img/a.png">'],
    ['work/index.html', ''],
    ['img/a.png', ''],
  ]);
  assert.deepEqual(findBrokenLinks(files), []);
});

test('built homepage never hides content with inline opacity:0', { skip: !existsSync('dist/index.html') }, () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.equal(/style="[^"]*opacity:\s*0[;"]/.test(html), false);
});

test('findPlaceholders also catches placeholders in href and src attributes', () => {
  assert.deepEqual(findPlaceholders('<a href="[BOOKING LINK]">Book</a>'), ['[BOOKING LINK]']);
});

test('findPlaceholders scans every attribute, not only href and src', () => {
  assert.deepEqual(findPlaceholders('<img alt="[PHOTO of Andrew]"><meta content="[DESC]"><b aria-label="[LABEL]"></b><a href="mailto:[EMAIL]">x</a>'),
    ['[PHOTO of Andrew]', '[DESC]', '[LABEL]', '[EMAIL]']);
});

test('findPlaceholders scans JSON-LD scripts', () => {
  assert.deepEqual(findPlaceholders('<script type="application/ld+json">{"name":"[NAME]"}</script>'), ['[NAME]']);
});

test('findPlaceholders catches a placeholder that wraps across lines', () => {
  assert.deepEqual(findPlaceholders('<p>[Two sentences on\nthe community.]</p>'), ['[Two sentences on the community.]']);
});

test('findPlaceholders catches a placeholder wrapped around inline markup', () => {
  assert.deepEqual(findPlaceholders('<p>[<strong>N</strong>]</p>'), ['[N]']);
});

test('findPlaceholders catches brackets that start with a digit', () => {
  assert.deepEqual(findPlaceholders('<dd>[2022 to present]</dd>'), ['[2022 to present]']);
});
