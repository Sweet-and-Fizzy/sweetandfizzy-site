import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Content that fades in must be hidden from the very first paint. If the
// hiding class arrives in a deferred script, anything on screen flashes:
// visible, then gone, then fading back in. A classic inline script in
// <head> runs before first paint.
test('the motion class is added by an inline script in the head', { skip: !existsSync('dist/index.html') }, () => {
  const head = readFileSync('dist/index.html', 'utf8').split('</head>')[0];
  const inline = [...head.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="module")[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
  assert.match(inline, /classList\.add\(['"]mo['"]\)/);
});
