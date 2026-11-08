import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const built = existsSync('dist/index.html');
const home = () => readFileSync('dist/index.html', 'utf8');

test('homepage has the three area sections', { skip: !built }, () => {
  for (const id of ['research', 'startups', 'websites']) assert.match(home(), new RegExp(`<section[^>]*id="${id}"`));
});

test('homepage says 13 communities share Connect.CI', { skip: !built }, () => {
  assert.match(home(), /13 communities share Connect\.CI/);
});

test('homepage links to all four Phase 1 case studies', { skip: !built }, () => {
  for (const s of ['access-support', 'access-ai-assistant', 'open-ondemand', 'mghpcc']) assert.match(home(), new RegExp(`href="/work/${s}/`));
});

test('homepage has no board file links', { skip: !built }, () => {
  assert.equal(/\.dc\.html/.test(home()), false);
});

test('startup and website sections end with a contact button for their audience', { skip: !built }, () => {
  assert.match(home(), /href="\/contact\/\?audience=startup"/);
  assert.match(home(), /href="\/contact\/\?audience=website"/);
});
