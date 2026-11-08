// Scans the built site for leftover copy placeholders like [CITY] and for
// internal links that point at pages the build did not produce.
// Normal builds only warn; `--strict` (the launch gate) exits 1 on findings.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// A placeholder is a bracket that opens on a capital letter: [CITY], [N%],
// [Two sentences on the community.]. It may wrap across lines.
const PLACEHOLDER = /\[[A-Z0-9][^\][<>]{0,200}\]/g;
const tidy = (m) => m.replace(/\s+/g, ' ');

export function findPlaceholders(html) {
  // JSON-LD is page copy too; other scripts, styles and code samples are not.
  const ld = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const markup = html.replace(/<(script|style|code|pre)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  // Every attribute value (alt, content, aria-label, href, ...).
  const attrs = [...markup.matchAll(/\s[\w:-]+="([^"]*)"/g)].flatMap((m) => m[1].match(PLACEHOLDER) || []);
  // Visible text, with inline tags removed so [<strong>N</strong>] reads [N].
  const text = markup.replace(/<[^>]+>/g, '');
  return [...attrs, ...(text.match(PLACEHOLDER) || []), ...ld.flatMap((j) => j.match(PLACEHOLDER) || [])].map(tidy);
}

function targetExists(path, files) {
  const clean = decodeURIComponent(path.replace(/^\//, ''));
  if (clean === '' ) return files.has('index.html');
  if (files.has(clean)) return true;
  const dir = clean.endsWith('/') ? clean : clean + '/';
  return files.has(dir + 'index.html') || files.has(clean + '.html');
}

export function findBrokenLinks(files) {
  const broken = [];
  for (const [file, html] of files) {
    if (!file.endsWith('.html')) continue;
    for (const [, href] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const path = href.split(/[?#]/)[0];
      if (!targetExists(path, files)) broken.push({ file, href });
    }
  }
  return broken;
}

function readDist(dir) {
  const files = new Map();
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else files.set(relative(dir, p), p.endsWith('.html') ? readFileSync(p, 'utf8') : '');
    }
  };
  walk(dir);
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const strict = process.argv.includes('--strict');
  const files = readDist('dist');
  let count = 0;
  for (const [file, html] of files) {
    if (!file.endsWith('.html')) continue;
    const found = [...new Set(findPlaceholders(html))];
    if (found.length) { count += found.length; console.log(`placeholder  ${file}: ${found.join('  ')}`); }
  }
  const broken = findBrokenLinks(files);
  for (const b of broken) console.log(`broken link  ${b.file}: ${b.href}`);
  console.log(`\n${count} placeholder(s), ${broken.length} broken link(s)${strict ? '' : ' (warning only; check:launch fails on these)'}`);
  if (strict && (count || broken.length)) process.exit(1);
}
