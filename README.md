# Sebastian Kolbusz Portfolio Website

A bilingual, high-performance portfolio platform built with Next.js 16 to showcase case studies, services, and technical depth for freelance and product engineering work.

## Project Overview

### Business Context

This project is the public-facing portfolio and lead funnel for a senior frontend engineer. It serves two primary functions:

- **Business Value:** Communicates expertise and results to non-technical clients.
- **Technical Excellence:** Demonstrates production-grade frontend architecture to technical reviewers and recruiters.

### Engineering Goals

- **Performance:** Deliver lightning-fast, static-first pages with a focus on Core Web Vitals.
- **SEO & Visibility:** Strong metadata APIs and structured JSON-LD data (ItemList, CreativeWork) for all routes.
- **Localization:** Full `en` and `pl` support using `next-intl` with route-preserving navigation.
- **Accessibility (a11y):** WCAG 2.2 AA compliant by default, with functional keyboard paths and skip-links.
- **Aesthetics:** Cinematic, animation-heavy UI (GSAP + WebGL) that remains performant and respects `prefers-reduced-motion`.

## Tech Stack

| Layer            | Choice                                      | Why this choice                                                        |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router)                     | Static Site Generation (SSG), Turbopack, and mature metadata handling. |
| **UI Library**   | React 19 + TypeScript                       | Latest React features (Compiler, Actions) with strict typing.          |
| **Styling**      | Tailwind CSS v4                             | CSS-first configuration, high performance, and modern design tokens.   |
| **Localization** | `next-intl`                                 | Type-safe messages and locale-aware routing in the App Router.         |
| **Motion**       | GSAP + Lenis + custom WebGL                 | Fine-grained control over smooth scrolling and complex animations.     |
| **State**        | Zustand                                     | Lightweight state for scroll and interaction orchestration.            |
| **Testing**      | Vitest + Testing Library + Playwright + Axe | Comprehensive unit, integration, and E2E testing with a11y checks.     |
| **Tooling**      | ESLint, Prettier, pnpm, Volta               | Enforced code standards and reproducible environments.                 |

## Architectural Decisions

1.  **Locale as a Primary Route Segment (`/[locale]/...`)**
    Ensures explicit, crawlable URLs and enables static generation per locale while preserving the path during language switches.

2.  **Domain Content & Locale Overlays**
    Project data is centralized in `src/data/`, with localized copy stored in `src/i18n/messages/`. This reduces content drift and ensures consistency.

3.  **Progressive Enhancement & Motion Control**
    Heavy client-side features (WebGL, custom cursors, smooth scrolling) are lazy-loaded and delayed. They are automatically disabled for users with `prefers-reduced-motion`.

4.  **Semantic SEO Foundation**
    Shared metadata builders and schema serializers maintain canonical URLs and structured data integrity across all localized routes.

5.  **Multi-Layered Quality Gate**
    A combination of Vitest (logic/components) and Playwright (E2E/a11y) ensures that every change meets the project's strict quality standards.

## Setup and Run Instructions

### Prerequisites

- **Node.js:** `24.14.0` (managed via [Volta](https://volta.sh/))
- **Package Manager:** `pnpm`

### Installation

```bash
pnpm install
pnpm exec playwright install
```

### Development

```bash
pnpm dev
```

The application will be available at [http://localhost:3000/en](http://localhost:3000/en).

### Production Build

```bash
pnpm build
pnpm start
```

## Testing

### Unit and Integration (Vitest)

```bash
pnpm test
```

### Coverage Reports

```bash
pnpm test:coverage
```

Current thresholds: Lines: `85%`, Statements: `85%`, Functions: `85%`, Branches: `80%`.

### End-to-End and Accessibility (Playwright)

```bash
pnpm test:e2e
```

To run against a specific URL:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url.com pnpm test:e2e
```

## Deployment

The project is optimized for **Vercel**, utilizing Next.js App Router features for optimal performance and deployment simplicity.

**Note on Build Manifests:** You may see "playwright" references in `.next` build manifests. These are strictly informational paths related to the `pnpm` content-addressable store and do **not** indicate that Playwright code is bundled into the client-side production assets.

## Known Limitations & Roadmap

- **Browser Coverage:** Currently optimized for Chromium; WebKit and Firefox coverage is planned.
- **CMS Integration:** Transitioning from file-based content to a headless CMS for easier updates.
- **WebGL Fallbacks:** Enhancing static fallbacks for older devices or restricted environments.
- **Automated Performance Monitoring:** Integrating Lighthouse CI for automated performance regression testing.
