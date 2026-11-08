import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sweetandfizzy.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
