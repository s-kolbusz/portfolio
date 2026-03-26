import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const CORE_ROUTES = [
  '/en',
  '/en/cv',
  '/en/projects',
  '/en/projects/zakofy',
  '/en/design',
  '/en/services',
] as const

const ROUTES_WITH_SKIP_LINK = [
  '/en',
  '/en/cv',
  '/en/projects',
  '/en/design',
  '/en/projects/zakofy',
  '/en/services',
  '/en/does-not-exist',
] as const

test('core routes have no serious or critical axe violations', async ({ page }) => {
  for (const route of CORE_ROUTES) {
    await page.goto(route)

    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()
    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious'
    )

    expect(
      blockingViolations,
      `${route} has blocking axe violations: ${blockingViolations
        .map((violation) => violation.id)
        .join(', ')}`
    ).toEqual([])
  }
})

test('skip link target exists on every localized route variant, including not-found', async ({
  page,
}) => {
  for (const route of ROUTES_WITH_SKIP_LINK) {
    await page.goto(route)

    await expect(page.getByRole('link', { name: /skip to main content/i })).toHaveAttribute(
      'href',
      '#page-content-start'
    )

    await expect(page.locator('#page-content-start')).toHaveCount(1)
  }
})

test('project book region is keyboard focusable and supports arrow navigation', async ({
  page,
}) => {
  await page.goto('/en/projects')

  const projectBook = page.getByRole('region', { name: 'Project Book' })
  await projectBook.focus()

  await expect(page.getByRole('tab', { name: 'Page 1' })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true')
})

test('project book traps focus to the active panel and ignores inactive panels', async ({
  page,
}) => {
  await page.goto('/en/projects')

  // Wait for the ToC panel to be visible
  const tocPanel = page.locator('#book-panel-0')
  await expect(tocPanel).toBeVisible()

  // First panel (ToC) should not be inert
  await expect(tocPanel).not.toHaveAttribute('inert', '')

  // Second panel (first project) should be inert
  const projectPanel = page.locator('#book-panel-1')
  await expect(projectPanel).toHaveAttribute('inert', '')

  // Navigate to next page using arrow key
  await page.keyboard.press('ArrowRight')

  // Wait for the URL or state to update (tab 2 becomes selected)
  await expect(page.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true')

  // Now first panel should be inert
  await expect(tocPanel).toHaveAttribute('inert', '')

  // And second panel should not be inert
  await expect(projectPanel).not.toHaveAttribute('inert', '')
})

test('lightbox restores focus to the trigger after keyboard close', async ({ page }) => {
  await page.goto('/en/projects/zakofy')

  const trigger = page.getByRole('button', { name: /view high-res/i }).first()
  await trigger.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: /image lightbox/i })
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('dock navigation exposes current position semantics', async ({ page }) => {
  await page.goto('/en')

  // Find the visible navigation
  const dockNav = page
    .getByRole('navigation', { name: /main navigation/i })
    .filter({ visible: true })
    .first()
  await expect(dockNav).toBeVisible()

  const dockHomeLink = dockNav.getByRole('link', { name: /home/i })
  await expect(dockHomeLink).toBeVisible()
  await expect(dockHomeLink).toHaveAttribute('aria-current', 'location')
})

test('custom cursor is available on non-home routes when reduced motion is off', async ({
  page,
}) => {
  await page.goto('/en/projects')
  await page.waitForTimeout(900)

  await expect(page.getByTestId('custom-cursor')).toHaveCount(1)
})

test('reduced-motion users do not get custom cursor or WebGL hero scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en')
  await page.waitForTimeout(900)

  await expect(page.getByTestId('custom-cursor')).toHaveCount(0)
  await expect(page.locator('canvas[aria-hidden="true"]')).toHaveCount(0)
})

test('target sizes meet WCAG 2.2 minimum requirements', async ({ page }) => {
  await page.goto('/en')
  await page.waitForTimeout(1000)

  const dockLinks = page.locator('.dock-nav a')
  const count = await dockLinks.count()

  for (let i = 0; i < count; i++) {
    const box = await dockLinks.nth(i).boundingBox()
    if (box) {
      // WCAG 2.2 AA target size is 24x24 CSS pixels
      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  }
})

test('theme toggle changes class on html element', async ({ page }) => {
  await page.goto('/en')

  const themeToggle = page.getByLabel(/toggle theme/i)
  await expect(themeToggle).toBeVisible()

  const html = page.locator('html')
  const initialTheme = await html.getAttribute('class')

  await themeToggle.click()
  const toggledTheme = await html.getAttribute('class')
  expect(toggledTheme).not.toEqual(initialTheme)
})
