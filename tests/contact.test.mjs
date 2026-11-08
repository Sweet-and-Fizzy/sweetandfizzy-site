import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { onSubmitResult, audienceFromQuery } from '../src/lib/contact.ts';

test('generate_lead fires once with the audience after a successful send', () => {
  const dl = [];
  onSubmitResult(true, 'proposal', dl);
  assert.deepEqual(dl, [{ event: 'generate_lead', lead_source: 'proposal' }]);
});

test('no lead event when the send fails', () => {
  const dl = [];
  onSubmitResult(false, 'proposal', dl);
  assert.deepEqual(dl, []);
});

test('audienceFromQuery accepts only known audiences', () => {
  assert.equal(audienceFromQuery('?audience=startup'), 'startup');
  assert.equal(audienceFromQuery('?audience=<script>'), '');
  assert.equal(audienceFromQuery(''), '');
});

const built = existsSync('dist/contact/index.html');
const html = () => readFileSync('dist/contact/index.html', 'utf8');

test('contact form is a Netlify form with a hidden honeypot', { skip: !built }, () => {
  assert.match(html(), /<form[^>]*name="contact"[^>]*data-netlify="true"/);
  assert.match(html(), /netlify-honeypot="company_url"/);
  assert.match(html(), /<input[^>]*name="company_url"[^>]*tabindex="-1"/);
});

test('every visible field has a label', { skip: !built }, () => {
  for (const name of ['name', 'email', 'organization', 'audience', 'deadline', 'message']) {
    const id = html().match(new RegExp(`name="${name}"[^>]*id="([^"]+)"|id="([^"]+)"[^>]*name="${name}"`));
    assert.ok(id, `no id for ${name}`);
    assert.match(html(), new RegExp(`<label[^>]*for="${id[1] || id[2]}"`), name);
  }
});

test('status messages live in polite and alert regions', { skip: !built }, () => {
  assert.match(html(), /aria-live="polite"/);
  assert.match(html(), /role="alert"/);
});

test('the form keeps native validation for visitors without JavaScript', { skip: !built }, () => {
  const form = html().match(/<form[^>]*name="contact"[^>]*>/)[0];
  assert.equal(/novalidate/i.test(form), false);
  assert.match(html(), /<input[^>]*name="email"[^>]*required|<input[^>]*required[^>]*name="email"/);
});
