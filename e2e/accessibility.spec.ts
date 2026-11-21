import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const CORE_ROUTES = [
  '/en',
  '/en/cv',
  '/en/projects',
  '/en/projects/ready2order',
  '/en/design',
  '/en/services',
] as const

const ROUTES_WITH_SKIP_LINK = [
  '/en',
  '/en/cv',
  '/en/projects',
  '/en/design',
  '/en/projects/ready2order',
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

// No live case study has a gallery right now: the client projects that had one
// moved to stronypodhale.pl (SEB-21) and ready2order is a role page without images.
// The focus-return contract is covered by lightbox.test.tsx meanwhile; re-enable
// this against the stronypodhale case study once SEB-73 adds it.
test.skip('lightbox restores focus to the trigger after keyboard close', async ({ page }) => {
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

test('the menu opens as a dialog, marks where you are and closes with Escape', async ({ page }) => {
  await page.goto('/en')

  const toggle = page.getByRole('button', { name: /^menu$/i })
  await expect(toggle).toBeVisible({ timeout: 15000 })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')

  await toggle.click()
  const menu = page.getByRole('dialog', { name: /menu/i })
  await expect(menu).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')

  const nav = menu.getByRole('navigation', { name: /main navigation/i })
  await expect(nav.getByRole('link', { name: /home/i })).toHaveAttribute('aria-current', 'location')

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(toggle).toBeFocused()
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

  const toggle = page.getByRole('button', { name: /^menu$/i })
  await expect(toggle).toBeVisible({ timeout: 15000 })
  await toggle.click()

  const targets = page.locator('#site-menu a, .site-bar button[aria-controls]')
  await expect(page.getByRole('dialog', { name: /menu/i })).toBeVisible()
  await page.waitForTimeout(1600)
  const count = await targets.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    const box = await targets.nth(i).boundingBox()
    if (box) {
      // WCAG 2.2 AA target size is 24x24 CSS pixels
      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  }
})
