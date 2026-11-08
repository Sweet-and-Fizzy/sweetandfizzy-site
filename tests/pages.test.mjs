import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(`dist/${p}/index.html`, 'utf8');
const built = existsSync('dist/index.html');

test('Connect.CI page shows the three tiers and onboarding price', { skip: !built }, () => {
  const html = read('connect-ci');
  for (const t of ['Community', 'Program', 'Partner', '$3,000', '$7,500', 'From $15,000', 'Onboarding starts at $5,000']) assert.ok(html.includes(t), t);
});

test('Connect.CI FAQ uses native details elements', { skip: !built }, () => {
  assert.ok((read('connect-ci').match(/<details/g) || []).length >= 5);
});

test('Connect.CI says 13 communities', { skip: !built }, () => {
  assert.match(read('connect-ci'), />13</);
});

test('Publications lists the HUST paper without a link', { skip: !built }, () => {
  const html = read('publications');
  const li = html.match(/<li(?=[\s>])[^>]*>(?:(?!<\/?li[\s>])[\s\S])*From Answering to Acting[\s\S]*?<\/li>/);
  assert.ok(li, 'HUST entry missing');
  assert.equal(/<a\b/.test(li[0]), false);
});

test('Publications links each published paper to its DOI', { skip: !built }, () => {
  const html = read('publications');
  for (const doi of ['10.1145/3785462.3815904', '10.1145/3785462.3815803', '10.1145/3569951.3597590', '10.22369/issn.2153-4136/13/2/4', '10.1145/3437359.3465606'])
    assert.ok(html.includes(`https://doi.org/${doi}`), doi);
});

test('AI agents page ends with a program contact call to action', { skip: !built }, () => {
  const html = read('services/ai-agents');
  assert.match(html, /From answering questions to submitting jobs/);
  assert.match(html, /href="\/contact\/\?audience=program"/);
});

test('Planning a proposal page ends with a proposal contact call to action', { skip: !built }, () => {
  const html = read('planning-a-proposal');
  assert.match(html, /From the first draft to the funded project/);
  assert.match(html, /href="\/contact\/\?audience=proposal"/);
});

test('proposal page strip lists each program with the NSF award the Connect.CI paper names', { skip: !built }, () => {
  const html = read('planning-a-proposal');
  const strip = html.match(/<ul[^>]*class="logo-strip"[\s\S]*?<\/ul>/);
  assert.ok(strip, 'no logo strip');
  for (const [name, award] of [['ACCESS MATCH', 'OAC-2138286'], ['CCMNet', 'OAC-2227656'], ['Open OnDemand', 'OAC-2303692'], ['Open OnDemand Appverse', 'OAC-2411375'], ['NAIRR', 'OAC-2505400']]) {
    assert.ok(strip[0].includes(name), name);
    assert.ok(strip[0].includes(`NSF ${award}`), award);
  }
});

test('Connect.CI shows its development supporters as a logo strip, including Texas A&M', { skip: !built }, () => {
  const strip = read('connect-ci').match(/<ul[^>]*class="logo-strip"[\s\S]*?<\/ul>/);
  assert.ok(strip, 'no supporters strip');
  for (const n of ['ACCESS (NSF)', 'MGHPCC', 'CU Boulder', 'Ohio Supercomputer Center', 'Texas A&amp;M']) assert.ok(strip[0].includes(n), n);
});
