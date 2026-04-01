# Sebastian Kolbusz Portfolio

A bilingual, high-performance portfolio platform built with Next.js 16. Targets 95+ Lighthouse performance, 100 accessibility/SEO, and serves as both a lead funnel for clients and a technical showcase for engineering reviewers.

**Live:** [kolbusz.xyz](https://www.kolbusz.xyz)

---

## Tech Stack

| Layer            | Choice                                        | Why                                                 |
| ---------------- | --------------------------------------------- | --------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router)                       | Full SSG, React Compiler, mature metadata API       |
| **UI Library**   | React 19 + TypeScript (strict)                | Latest features, type-safe throughout               |
| **Styling**      | Tailwind CSS v4                               | CSS-first config, design tokens                     |
| **Localization** | next-intl                                     | Type-safe messages, locale-aware App Router routing |
| **Motion**       | GSAP + Lenis + WebGL                          | Fine-grained scroll and animation control           |
| **State**        | Zustand                                       | Lightweight, scroll/interaction orchestration       |
| **Testing**      | Vitest + Playwright + Axe                     | Unit, integration, E2E, and accessibility coverage  |
| **Tooling**      | ESLint (Perfectionist), Prettier, pnpm, Volta | Enforced standards, reproducible environments       |

---

## Setup

**Prerequisites:** Node.js `24.14.0` (via [Volta](https://volta.sh/)), `pnpm`

```bash
pnpm install
pnpm exec playwright install chromium --with-deps  # E2E only
```

App starts at `http://localhost:3000/en`.

---

## Commands

```bash
pnpm dev                        # Dev server
pnpm build                      # Production build
pnpm start                      # Preview production build (required before E2E)

pnpm typecheck                  # TypeScript
pnpm lint:fix                   # ESLint with auto-fix
pnpm format                     # Prettier

pnpm test                       # Vitest (run once)
pnpm test:watch                 # Vitest watch
pnpm test:coverage              # With 85% coverage gate

pnpm test:e2e                   # All Playwright E2E
pnpm test:e2e:functional        # E2E excluding visual regression
pnpm test:e2e:visual            # Visual regression only
pnpm test:e2e:update-snapshots  # Regenerate baselines (see note below)

pnpm ci:verify                  # Full pipeline: format → lint → typecheck → test → e2e
```

---

## Architecture

### Routing & i18n

All routes are nested under `src/app/[locale]/`. Both locales (`en`, `pl`) have explicit, crawlable URLs — no redirect-based language detection. `dynamicParams = false` and `dynamic = 'force-static'` enforce full SSG at build time. Always use helpers from `src/i18n/navigation.ts` instead of Next.js `Link`/`useRouter` directly to preserve locale.

### Data & Content

Portfolio content is statically defined in `src/data/`. Each entry has a locale-independent base (`projects.ts`) merged with per-locale copy (`projects-en.ts`, `projects-pl.ts`) at build time. No CMS calls at runtime — all content is statically embedded and zero-latency at the edge.

### Animation System

`src/hooks/timeline/` orchestrates all scroll-triggered reveals. Components call `useTimeline(ref, config, setup)` and declare their animations via a `reveal()` callback — the engine handles ScrollTrigger setup, reduced-motion adaptation, and cleanup on unmount.

Animation tokens (duration, easing, stagger values) live in `src/lib/constants/animations.ts`. **Only GPU-accelerated properties** (`transform`, `opacity`) are ever animated — never layout properties (`width`, `height`, `padding`). This is a hard constraint enforced by convention in `reveal-engine.ts`.

Client-heavy features (custom cursor, Lenis, dock nav) are dynamically imported with `ssr: false` and deferred 500ms via `ClientOverlays` to free the main thread during hydration.

### SEO Architecture

- Shared metadata factories in `src/lib/page-metadata.ts` generate canonical + hreflang alternates for every page and locale.
- JSON-LD structured data: `Person` + `WebSite` globally (layout), `CreativeWork` on project pages, `ItemList` on the projects listing.
- `SEOText` component provides a progressive-disclosure accordion for keyword-rich long-form content that doesn't break the cinematic visual flow.
- IndexNow integration (`pnpm seo:indexnow`) submits all URLs to search engines on deployment.

---

## CI/CD

Seven parallel jobs on every PR:

```
audit ─────────────────────────── dependency audit
static ─────────────────────────── format / lint / typecheck
unit-tests ─────────────────────── Vitest coverage gate
build ──────────────────────────── Next.js build → artifact
  ├── e2e ────────────────────────── functional Playwright tests
  ├── e2e-visual ─────────────────── visual regression (Linux Chromium)
  └── lighthouse ─────────────────── ≥95 perf, 100 a11y/SEO/best-practices
```

The build artifact (`.next/`) is shared across the three post-build jobs to avoid rebuilding three times.

### Visual Regression Snapshots

Snapshots must be generated on **Linux** (same environment as CI). Running `pnpm test:e2e:update-snapshots` locally on macOS produces different font rendering and will immediately fail CI.

**To update snapshots after a UI change:** trigger the **Update Visual Snapshots** workflow from the Actions tab on your branch. It builds the app, regenerates all snapshot baselines in the correct environment, and commits them back to your branch automatically.

---

## Performance Budgets

| Metric                    | Target   |
| ------------------------- | -------- |
| Lighthouse Performance    | ≥ 95     |
| Lighthouse Accessibility  | 100      |
| Lighthouse SEO            | 100      |
| Lighthouse Best Practices | 100      |
| LCP                       | ≤ 1500ms |
| TBT                       | ≤ 200ms  |
| CLS                       | ≤ 0.1    |
| Total JS budget           | 250 KB   |
| Total page weight         | 600 KB   |

---

## Deployment

Optimized for **Vercel**. Vercel Analytics and Speed Insights load only in production (`NODE_ENV === 'production' && VERCEL === '1'`).

| Variable              | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `PLAYWRIGHT_BASE_URL` | Override E2E base URL (e.g. staging preview) |
