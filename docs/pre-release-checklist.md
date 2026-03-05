# Pre-Release Verification Checklist

Use this checklist before creating a release tag or deploying to production.

## 1. Required Automated Gates

- [ ] `pnpm lint:ci`
- [ ] `pnpm check:conventions`
- [ ] `pnpm check:architecture`
- [ ] `pnpm typecheck`
- [ ] `pnpm test:coverage`
- [ ] `pnpm test:e2e --workers=1`
- [ ] `pnpm format:check`
- [ ] `pnpm build`

## 2. Critical User Flows

- [ ] Locale switch keeps the current route path (for example: `/en/projects/zakofy` -> `/pl/projects/zakofy`).
- [ ] Home dock section navigation scrolls correctly for in-page sections.
- [ ] Projects flow works end-to-end: list -> detail -> next project -> previous project.
- [ ] JSON-LD scripts are present for projects index (`ItemList`) and project detail (`CreativeWork`).
- [ ] Canonical metadata points to `https://www.kolbusz.xyz/...` on localized routes.

## 3. Release Readiness

- [ ] No uncommitted local changes beyond intended release changes.
- [ ] CI workflow on the release commit is green.
- [ ] Any known risks or deferred items are documented in release notes.
