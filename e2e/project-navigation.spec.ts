import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openRoute(page: Page, path: string) {
  await page.request.get(path, { timeout: 120_000 })
  await page.goto(path, { timeout: 60_000, waitUntil: 'domcontentloaded' })
}

test('project list navigation reaches details and preserves prev/next project sequence', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 900, height: 1200 })
  await openRoute(page, '/en/projects')

  const zakofyLink = page.getByRole('link', { name: /zakofy/i }).first()
  await expect(zakofyLink).toBeVisible()
  await zakofyLink.click()

  await expect(page).toHaveURL(/\/en\/projects\/zakofy$/)
  await expect(page.getByRole('navigation', { name: 'Project navigation' })).toBeVisible()

  const nextProjectLink = page.getByRole('link', { name: /next project/i })
  await expect(nextProjectLink).toHaveAttribute('href', /\/en\/projects\/your-krakow-travel$/)
  await nextProjectLink.click()

  await expect(page).toHaveURL(/\/en\/projects\/your-krakow-travel$/)

  const previousProjectLink = page.getByRole('link', { name: /previous project/i })
  await expect(previousProjectLink).toHaveAttribute('href', /\/en\/projects\/zakofy$/)
  await previousProjectLink.click()

  await expect(page).toHaveURL(/\/en\/projects\/zakofy$/)
})
