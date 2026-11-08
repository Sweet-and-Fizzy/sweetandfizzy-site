import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

// An unquoted comma inside an inline YAML map silently turns the rest of a
// sentence into an empty key, which the schema then drops. Catch that here.
export function nullKeys(obj, path = '') {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).flatMap(([k, v]) => (v === null ? [`${path}.${k}`] : nullKeys(v, `${path}.${k}`)));
}

test('nullKeys finds a sentence split by an unquoted comma', () => {
  assert.deepEqual(nullKeys(parse('- { name: Eggz, line: A app we designed, built and led. }')), ['.0.built and led.']);
});

for (const dir of ['src/content/pages', 'src/content/work']) {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.yaml'))) {
    test(`${dir}/${f} has no empty keys from unquoted commas`, () => {
      assert.deepEqual(nullKeys(parse(readFileSync(`${dir}/${f}`, 'utf8'))), []);
    });
  }
}
