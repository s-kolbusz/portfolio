import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// The redesign lives at /v2/<locale> next to the old site (owner, 2026-11-26): its own root layout,
// its own nav, kept out of search. The old site's tests stay in the other specs, at the old addresses.

test('/v2 opens the English redesign', async ({ page }) => {
  await page.goto('/v2')
  await expect(page).toHaveURL(/\/v2\/en$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

for (const locale of ['en', 'pl'] as const) {
  test(`/v2/${locale} is not indexed and points at itself`, async ({ page }) => {
    await page.goto(`/v2/${locale}`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/v2/${locale}$`)
    )
  })
}

test('/v2/en has no critical or serious axe violations', async ({ page }) => {
  await page.goto('/v2/en')
  await page.waitForTimeout(1000)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  const blocking = results.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? '')
  )
  expect(blocking.map((v) => v.id)).toEqual([])
})

test('the menu opens as a dialog, marks where you are and closes with Escape', async ({ page }) => {
  await page.goto('/v2/en')

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

test('the menu keeps the home inside /v2 and switches language within it', async ({ page }) => {
  await page.goto('/v2/en')
  const toggle = page.getByRole('button', { name: /^menu$/i })
  await expect(toggle).toBeVisible({ timeout: 15000 })
  await toggle.click()

  const menu = page.getByRole('dialog', { name: /menu/i })
  await expect(menu.getByRole('link', { name: 'Polski' })).toHaveAttribute('href', '/v2/pl')
  await expect(menu.getByRole('link', { name: /^cv$/i })).toHaveAttribute('href', '/en/cv')
})

test('menu targets meet WCAG 2.2 minimum size', async ({ page }) => {
  await page.goto('/v2/en')

  const toggle = page.getByRole('button', { name: /^menu$/i })
  await expect(toggle).toBeVisible({ timeout: 15000 })
  await toggle.click()

  const targets = page.locator('#site-menu a, .site-bar button[aria-controls]')
  await expect(page.getByRole('dialog', { name: /menu/i })).toBeVisible()
  await page.waitForTimeout(1600)
  // one read of every target: a boundingBox() call per link waits on each one and, with the menu's
  // canvas running on a slow CI machine, ran past the test timeout
  const boxes = await targets.evaluateAll((elements) =>
    elements
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 || rect.height > 0)
      .map((rect) => ({ height: rect.height, width: rect.width }))
  )
  expect(boxes.length).toBeGreaterThan(0)

  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(24)
    expect(box.height).toBeGreaterThanOrEqual(24)
  }
})

test('the old site keeps its own shell next to /v2', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('.dock-nav').first()).toBeAttached({ timeout: 15000 })
  await expect(page.locator('.site-bar')).toHaveCount(0)
})
