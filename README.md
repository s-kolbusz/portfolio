# Sebastian Kolbusz Portfolio Website

A bilingual portfolio platform built with Next.js 16 to showcase case studies, services, and technical depth for freelance and product engineering work.

## Project Overview

### Business Context

This project is the public-facing portfolio and lead funnel for a senior frontend engineer. It has two jobs:

- communicate business value to non-technical clients
- demonstrate production-grade frontend architecture to technical reviewers and recruiters

### Engineering Goals

- Deliver fast, static-first pages with strong SEO and structured data.
- Support full `en` and `pl` localization with route-preserving navigation.
- Keep animation-heavy UI performant without breaking accessibility.
- Enforce quality with automated lint, type, test, and build gates.

## Tech Stack

| Layer        | Choice                                      | Why this choice                                                              |
| ------------ | ------------------------------------------- | ---------------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router)                     | Static generation, strong metadata APIs, mature deployment story.            |
| UI           | React 19 + TypeScript                       | Predictable component model with strict typing for maintainability.          |
| Styling      | Tailwind CSS v4                             | Fast iteration with consistent design tokens and low CSS drift.              |
| Localization | `next-intl`                                 | Locale-aware routing, messages, and server/client integration in App Router. |
| Motion       | GSAP + Lenis + custom WebGL                 | Cinematic interactions with explicit performance control points.             |
| State        | Zustand                                     | Minimal shared client state for scroll and interaction orchestration.        |
| Testing      | Vitest + Testing Library + Playwright + Axe | Unit/integration/e2e + accessibility checks in one pipeline.                 |
| Tooling      | ESLint, Prettier, pnpm, GitHub Actions      | Consistent local/CI quality gates and reproducible builds.                   |

## Architectural Decisions

1. Locale as a first-class route segment (`/[locale]/...`)
   Keeps URLs explicit and crawlable, enables static generation per locale, and preserves path when switching language.

2. Split domain content into base data + locale overlays
   Portfolio entry structure lives in one place, localized copy in locale-specific files. This reduces drift and catches missing translations early.

3. Progressive enhancement for expensive client overlays
   Custom cursor, smooth scrolling, dock UI, and WebGL scene mount after initial render and are disabled or reduced for motion-sensitive users.

4. Centralized metadata and JSON-LD helpers
   Shared metadata builders and schema serializers keep canonical URLs and structured data consistent across pages.

5. Layered quality strategy
   Unit/integration tests cover logic and component behavior, while Playwright validates high-risk user flows and accessibility semantics.

## Setup and Run Instructions

### Prerequisites

- Node.js `22.16.1` (matches `package.json` Volta config)
- pnpm `10.x`

### Install

```bash
pnpm install
pnpm exec playwright install
```

### Run in Development

```bash
pnpm dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

### Build and Run Production

```bash
pnpm build
pnpm start
```

## Testing Guidelines

### Unit and Integration

```bash
pnpm test
```

Runs Vitest for `src/**/*.test.{ts,tsx}`.

### Coverage Gate

```bash
pnpm test:coverage
```

Coverage thresholds:

- lines: `80%`
- statements: `80%`
- functions: `75%`
- branches: `70%`

### End-to-End and Accessibility

```bash
pnpm test:e2e
```

By default, Playwright starts `pnpm dev`. To run against an existing server (for example `next start`), set:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm test:e2e
```

### CI Policy

CI runs on every push and pull request and requires all of the following to pass:

- `pnpm lint:ci` (zero warnings)
- `pnpm typecheck`
- `pnpm test:coverage`
- `pnpm format:check`
- `pnpm build`

## Code Quality Standards

- Lint: `pnpm lint:ci` must pass with zero warnings.
- Type safety: `pnpm typecheck` must pass.
- Formatting: `pnpm format:check` must pass.
- Accessibility: no serious or critical Axe violations on core routes; skip-link and keyboard paths must remain functional.
- Every change should preserve canonical metadata and JSON-LD correctness on localized routes.

## Performance and Accessibility Notes

- Heavy client overlays are lazy-loaded and delayed to reduce hydration pressure.
- WebGL hero background is mounted only after a delay and skipped when `prefers-reduced-motion` is enabled.
- Reduced-motion users do not receive custom cursor/WebGL effects.
- Scroll and animation orchestration is isolated in dedicated hooks/modules to avoid render-time side effects.
- Keyboard navigation is tested for critical interactive flows (project book navigation and lightbox focus handling).

## Deployment

### Canonical Host

Canonical metadata is configured around: `https://www.kolbusz.xyz`.

### Recommended

Deploy on Vercel for the simplest Next.js App Router path.

### Alternative

Any Node host that supports Next.js production runtime:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

## Environment Variables

No runtime environment variables are required to run the application locally.

Optional variables:

- `PLAYWRIGHT_BASE_URL`: tells Playwright to reuse an existing app server instead of starting `pnpm dev`.

## Known Limitations / Future Improvements

- E2E suite currently targets Chromium only; add cross-browser coverage (WebKit and Firefox).
- Locales are currently limited to English and Polish.
- Portfolio content is file-based; a CMS-backed workflow could improve content operations.
- WebGL fallback can be expanded with a static visual for older/locked-down devices.
- Performance budgets are validated manually; automated Lighthouse CI would tighten regressions.

## Additional Project Docs

- Pre-release checklist: [docs/pre-release-checklist.md](docs/pre-release-checklist.md)
- Refactoring task plan: [docs/task_plan.md](docs/task_plan.md)
- Progress log: [docs/progress.md](docs/progress.md)
