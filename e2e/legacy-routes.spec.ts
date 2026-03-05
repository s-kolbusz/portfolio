import { expect, test } from '@playwright/test'

const REMOVED_ROUTES = [
  '/en/about',
  '/en/services',
  '/en/contact',
  '/en/projects',
  '/en/projects/zakofy',
  '/en/cv',
  '/en/design',
] as const

test('removed route taxonomy returns 404 without compatibility redirects', async ({ page }) => {
  for (const route of REMOVED_ROUTES) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })

    expect(response?.status(), `${route} should return 404`).toBe(404)
    await expect(page).toHaveURL(route)
    await expect(page.getByRole('heading', { level: 1, name: /404/i })).toBeVisible()
  }
})
