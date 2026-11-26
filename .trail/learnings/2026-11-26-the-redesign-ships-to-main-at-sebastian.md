---
title: "The redesign ships to main at /v2 next to the frozen old site, one app and one deployment"
author: Sebastian
date: 2026-11-26
branch: release/v2
cost: { minutes: 13, tokens: 262230 }
id: l-e3f10870
scope: repo
status: active
src: agent
touches:
  - src/i18n/navigation-v2.tsx
  - src/proxy.ts
  - next.config.ts
  - src/components/sections/contact.tsx
---

## Decided
On 2026-11-26 the owner lifted the "never merge the redesign to main" rule. The redesign goes live at /v2/<locale> while the old site stays exactly as it was at /en and /pl. Later the swap puts the new site at the root and the old one under /legacy.
He rejected a second Vercel project, a v2 subdomain and rewrites to another deployment as a patchwork: "if we touch main anyway, do it properly from the start". So it is one Next app and one deployment with two root layouts. Moving between them is a full page load, so neither shell's CSS or scripts leak into the other.

## Tried and ruled out
- Branch preview URL: it sits behind Vercel Authentication, so nobody else can open it.
- v2 subdomain pinned to the branch: works, but the owner chose a path.
- basePath on a separate deployment proxied from main: needs a second project, and every root asset path (about 45) would have to change.

## Watch out
- src/legacy/ holds main's versions of every file the redesign changed or deleted: old shell, dock nav, settings dock, old cursor, old hero, old contact. It is frozen and excluded from coverage. Never edit it to "share" code with the redesign.
- The redesign's links go through src/i18n/navigation-v2.tsx. The home page and its #parts stay under /v2; CV, projects and services exist only in the old design, so they link to their old addresses.
- The proxy skips /v2 entirely, because next-intl would read "v2" as a missing locale and redirect to /en/v2/...
- Message files hold both sites' keys. The contact namespace is the union of the old and new keys (no key overlaps with a different value).
- /v2 is noindex with a self canonical, and the sitemap does not list it.

In the code: src/app/v2/[locale]/{layout,page}.tsx, src/app/[locale]/{layout,page}.tsx (main versions pointing at src/legacy), src/proxy.ts, next.config.ts (/v2 → /v2/en), e2e/v2.spec.ts.
