import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const CORE_ROUTES = ['/en', '/en/resume', '/en/work', '/en/work/zakofy', '/en/lab'] as const
const ROUTES_WITH_SKIP_LINK = [
  '/en',
  '/en/resume',
  '/en/work',
  '/en/lab',
  '/en/work/zakofy',
  '/en/does-not-exist',
] as const

async function openRoute(page: Page, route: string) {
  await page.goto(route, { timeout: 60_000, waitUntil: 'load' })
}

async function getBookScrollState(page: Page) {
  return page.evaluate(() => {
    const container = document.querySelector<HTMLElement>('[data-lenis-prevent]')
    const selectedTab = document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    const activePanel = document.activeElement as HTMLElement | null

    return {
      activeId: activePanel?.id ?? null,
      scrollLeft: container?.scrollLeft ?? null,
      selectedTab: selectedTab?.getAttribute('aria-label') ?? null,
    }
  })
}

test('core routes have no serious or critical axe violations', async ({ page }) => {
  test.setTimeout(180_000)

  for (const route of CORE_ROUTES) {
    await openRoute(page, route)

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
  test.setTimeout(180_000)

  for (const route of ROUTES_WITH_SKIP_LINK) {
    await openRoute(page, route)

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
  await openRoute(page, '/en/work')

  const projectBook = page.getByRole('region', { name: 'Project Book' })
  await expect(projectBook).toHaveAttribute('tabindex', '0')
  await projectBook.focus()

  await expect(page.getByRole('tab', { name: 'Page 1' })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(700)
  await expect(page.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true')
  await expect(
    page.locator('#book-panel-1').getByRole('link', { name: 'Explore Case Study' })
  ).toBeFocused()
})

test('project book keeps a sane keyboard order and requires activation for page dots', async ({
  page,
}) => {
  await openRoute(page, '/en/work')

  const projectBook = page.getByRole('region', { name: 'Project Book' })
  await expect(projectBook).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Back' })).toBeFocused()

  const firstDot = page.getByRole('tab', { name: 'Page 1' })
  await firstDot.focus()
  await expect(firstDot).toBeFocused()

  await page.keyboard.press('ArrowRight')

  const secondDot = page.getByRole('tab', { name: 'Page 2' })
  await expect(secondDot).toBeFocused()
  await expect(firstDot).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('Enter')
  await page.waitForTimeout(700)

  const secondPanelCaseStudyLink = page
    .locator('#book-panel-1')
    .getByRole('link', { name: 'Explore Case Study' })
  await expect(secondDot).toHaveAttribute('aria-selected', 'true')
  await expect(secondPanelCaseStudyLink).toBeFocused()
})

test('project spread tabs through its own controls and reaches the back button', async ({
  page,
}) => {
  await openRoute(page, '/en/work')

  const projectBook = page.getByRole('region', { name: 'Project Book' })
  await expect(projectBook).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(700)

  const activePanel = page.locator('#book-panel-1')
  const caseStudyLink = activePanel.getByRole('link', { name: 'Explore Case Study' })
  await expect(caseStudyLink).toBeFocused()

  const launchSiteLink = activePanel.getByRole('link', { name: 'Launch Site' })
  await page.keyboard.press('Tab')
  await expect(launchSiteLink).toBeFocused()

  const backButton = page.getByRole('button', { name: 'Back to Portfolio' })
  await page.keyboard.press('Tab')
  await expect(backButton).toBeFocused()
  await expect(page.getByRole('tab', { name: 'Page 2' })).toHaveAttribute('aria-selected', 'true')
})

test('project book supports consecutive arrow-key navigation between spreads', async ({ page }) => {
  await openRoute(page, '/en/work')

  const projectBook = page.getByRole('region', { name: 'Project Book' })
  await expect(projectBook).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(700)

  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(700)

  const state = await getBookScrollState(page)

  expect(state.selectedTab).toBe('Page 3')
  await expect(
    page.locator('#book-panel-2').getByRole('link', { name: 'Explore Case Study' })
  ).toBeFocused()
  expect(state.scrollLeft).toBeGreaterThan(2000)
})

test('toc enter key opens the selected project instead of stopping on the first spread', async ({
  page,
}) => {
  await openRoute(page, '/en/work')

  const targetProject = page.getByRole('button', { name: /02 Your Krakow Travel 2025 E-Commerce/i })
  await targetProject.focus()
  await expect(targetProject).toBeFocused()

  await page.keyboard.press('Enter')
  await page.waitForTimeout(1200)

  const state = await getBookScrollState(page)

  expect(state.selectedTab).toBe('Page 3')
  await expect(
    page.locator('#book-panel-2').getByRole('link', { name: 'Explore Case Study' })
  ).toBeFocused()
  expect(state.scrollLeft).toBeGreaterThan(2000)
})

test('dock navigation is hidden on every non-home route', async ({ page }) => {
  test.setTimeout(120_000)

  for (const route of ['/en/work', '/en/resume', '/en/lab'] as const) {
    await openRoute(page, route)
    await page.waitForTimeout(700)

    await expect(page.getByRole('button', { name: 'Home' })).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0)
  }
})

test('lightbox restores focus to the trigger after keyboard close', async ({ page }) => {
  await openRoute(page, '/en/work/zakofy')

  const trigger = page.getByRole('button', { name: /view high-res/i }).first()
  await trigger.focus()
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: /image lightbox/i })
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('desktop dock navigation exposes current position semantics', async ({ page }) => {
  await openRoute(page, '/en')
  await page.waitForTimeout(700)

  await expect(page.getByRole('button', { name: 'Home' })).toHaveAttribute(
    'aria-current',
    'location'
  )
})

test('custom cursor is available on non-home routes when reduced motion is off', async ({
  page,
}) => {
  await openRoute(page, '/en/resume')
  await page.waitForTimeout(1200)

  await expect(page.getByTestId('custom-cursor')).toHaveCount(1)
})

test('reduced-motion users do not get custom cursor or WebGL hero scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openRoute(page, '/en')
  await page.waitForTimeout(900)

  await expect(page.getByTestId('custom-cursor')).toHaveCount(0)
  await expect(page.locator('canvas[aria-hidden="true"]')).toHaveCount(0)
})
