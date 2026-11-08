import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Every built HTML page, as a URL path. New pages are picked up automatically.
export function builtPages(dir = 'dist'): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name === 'index.html') out.push('/' + relative(dir, d).replace(/\\/g, '/') + (d === dir ? '' : '/'));
    }
  };
  walk(dir);
  return out.map((p) => p.replace(/^\/\/$/, '/')).sort();
}
