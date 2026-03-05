import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openRoute(page: Page, route: string) {
  await page.goto(route, { timeout: 60_000, waitUntil: 'load' })
}

test('homepage keeps the full about, services, and contact sections', async ({ page }) => {
  await openRoute(page, '/en')

  await expect(
    page.getByText(
      "I treat engineering as a craft. It's not just about writing code; it's about creating digital environments that feel natural, responsive, and human."
    )
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The Workflow' })).toBeVisible()
  await expect(page.getByText('Operating From', { exact: true })).toBeVisible()
})

test('extension routes provide an explicit way back to the homepage', async ({ page }) => {
  const cases = [
    {
      route: '/en/resume',
      label: 'Back to Overview',
      role: 'link',
    },
    {
      route: '/en/work',
      label: 'Back',
      role: 'button',
    },
    {
      route: '/en/lab',
      label: 'Back to Overview',
      role: 'link',
    },
  ] as const

  for (const entry of cases) {
    await openRoute(page, entry.route)
    await expect(page.getByRole(entry.role, { name: entry.label })).toBeVisible()
  }
})

test('case study back link stays fixed while the page scrolls', async ({ page }) => {
  await openRoute(page, '/en/work/zakofy')

  const backLink = page.getByRole('link', { name: 'Back' })
  const before = await backLink.boundingBox()
  expect(before).not.toBeNull()

  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  )

  const after = await backLink.boundingBox()
  expect(after).not.toBeNull()

  expect(after!.y).toBeCloseTo(before!.y, 1)
  expect(after!.x).toBeCloseTo(before!.x, 1)
})
