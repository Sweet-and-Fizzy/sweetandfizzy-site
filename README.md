# sweetandfizzy.com

Astro static site for Sweet & Fizzy Digital, deployed on Netlify.

- `npm run dev` local server
- `npm test` unit tests (check script)
- `npm run check` type check, build, and list leftover `[PLACEHOLDER]` copy and broken links (warnings)
- `npm run sweep` accessibility and mobile sweep of every built page (Playwright + axe)
- `npm run check:launch` the launch gate: fails on any placeholder, broken link or sweep failure

Copy lives in `src/content/`. Layout lives in `src/components/` and `src/layouts/`.
The build plan is in `docs/superpowers/plans/`.
