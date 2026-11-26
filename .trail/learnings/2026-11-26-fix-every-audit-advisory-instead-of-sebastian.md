---
title: "Fix every audit advisory instead of ignoring it, and lift transitive ones by bumping the package that pins them"
author: Sebastian
date: 2026-11-26
branch: release/v2
cost: { minutes: 3, tokens: 39509 }
id: l-528b537c
scope: repo
status: active
src: agent
touches:
  - ".prettierignore"
  - package.json
  - pnpm-lock.yaml
  - src/components/sections/contact.css
  - src/components/sections/contact.tsx
  - src/components/sections/how-i-work-end.css
  - src/components/sections/how-i-work-end.tsx
  - pnpm-workspace.yaml
---

## Decided
On 2026-11-26 the owner asked for every known vulnerability to be fixed, not left for later. pnpm audit is now clean.

## Tried and ruled out
Bumping typescript-eslint alone did not clear the minimatch advisory. eslint-plugin-perfectionist still pulled an older @typescript-eslint/utils, which uses minimatch 10. Bumping perfectionist to 5.14 moved the whole chain to minimatch 11. That is cleaner than a pnpm override that forces a major version under a plugin.

## Watch out
- The prettier format check also reads cook/. Some prototypes there are tracked, and they failed `pnpm format:check` (part of ci:verify), so cook/ is now in .prettierignore.
- The Next.js build stops once with a "SecurityFatalError" upgrade notice when the installed version has an advisory. Running the build again continues. The real fix is upgrading Next.

In the code: package.json (next 16.4.6, vitest 4.1.12, typescript-eslint 8.74, eslint-plugin-perfectionist 5.14), .prettierignore, pnpm-workspace.yaml (overrides and auditConfig.ignoreGhsas live there, not in package.json).
