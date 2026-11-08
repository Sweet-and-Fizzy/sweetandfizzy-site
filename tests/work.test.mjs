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

test('every figure without an image renders the labelled placeholder, never an empty img', { skip: !built }, async () => {
  const { parse } = await import('yaml');
  for (const s of slugs) {
    const d = parse(readFileSync(`src/content/work/${s}.yaml`, 'utf8'));
    const figs = [...d.chapters.flatMap((c) => c.figures || []), ...(d.today.figures || [])];
    const missing = figs.filter((f) => !f.image && !f.chart && !f.process).length;
    const html = readFileSync(page(s), 'utf8');
    assert.equal((html.match(/class="ph"/g) || []).length, missing, s);
    assert.equal(/<img[^>]*src=""/.test(html), false, s);
  }
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

test('case breadcrumbs link both Case stories and Research computing', { skip: !built }, () => {
  for (const s of slugs) {
    const crumb = readFileSync(page(s), 'utf8').match(/<nav aria-label="Breadcrumb"[\s\S]*?<\/nav>/)[0];
    assert.match(crumb, /href="\/work\/"/, s);
    assert.match(crumb, /<a[^>]*href="\/#research"[^>]*>Research computing<\/a>/, s);
  }
});

test('the AI evaluation chapter shows the process as ordered steps, without result numbers', { skip: !built }, () => {
  const html = readFileSync(page('access-ai-assistant'), 'utf8');
  const proc = html.match(/<ol[^>]*class="[^"]*process[^"]*"[\s\S]*?<\/ol>/);
  assert.ok(proc, 'no process diagram');
  assert.ok((proc[0].match(/<li/g) || []).length >= 4, 'too few steps');
  const chapter = html.split('Evaluation battery')[1].split('Where it is today')[0];
  for (const n of ['0.97', '0.47', '337', '88 facts', '34 questions']) assert.equal(chapter.includes(n), false, n);
});

test('Connect.CI Community membership is $5,000 a year everywhere', { skip: !built }, () => {
  assert.match(readFileSync('dist/connect-ci/index.html', 'utf8'), /\$5,000<\/span>\s*<span[^>]*>a year/);
  assert.match(readFileSync('dist/index.html', 'utf8'), /Membership starts at \$5,000 a year/);
  assert.equal(/\$3,000/.test(readFileSync('dist/connect-ci/index.html', 'utf8') + readFileSync('dist/index.html', 'utf8')), false);
});

test('the AI Where it is today section shows the widget beside its text', { skip: !built }, () => {
  const html = readFileSync(page('access-ai-assistant'), 'utf8');
  const goal = html.match(/<section[^>]*aria-labelledby="results"[\s\S]*?<\/section>/)[0];
  assert.match(goal, /class="ch-row"/);
  assert.match(goal, /ACCESS Q&amp;A widget|ACCESS Q&A widget/);
  assert.match(goal, /<img[^>]*alt="The ACCESS Q(&amp;|&#38;)A widget/);
});
