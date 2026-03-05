import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openRoute(page: Page, path: string) {
  await page.goto(path, { timeout: 60_000, waitUntil: 'load' })
}

test('project list navigation reaches details and preserves prev/next project sequence', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 900, height: 1200 })
  await openRoute(page, '/en/work')

  const zakofyCard = page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Zakofy' }) })
  await expect(zakofyCard).toHaveCount(1)
  await zakofyCard.getByRole('link', { name: /explore case study/i }).click()

  await expect(page).toHaveURL(/\/en\/work\/zakofy$/)
  await expect(page.getByRole('navigation', { name: 'Project navigation' })).toBeVisible()

  const nextProjectLink = page.getByRole('link', { name: /next project/i })
  await expect(nextProjectLink).toHaveAttribute('href', /\/en\/work\/your-krakow-travel$/)
  await nextProjectLink.click()

  await expect(page).toHaveURL(/\/en\/work\/your-krakow-travel$/)

  const previousProjectLink = page.getByRole('link', { name: /previous project/i })
  await expect(previousProjectLink).toHaveAttribute('href', /\/en\/work\/zakofy$/)
  await previousProjectLink.click()

  await expect(page).toHaveURL(/\/en\/work\/zakofy$/)
})
