import { expect, test } from '@playwright/test'

test('redirects to the default locale and renders the hero heading', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/en\/?$/)
  await expect(page.getByRole('heading', { level: 1, name: /sebastian kolbusz/i })).toBeVisible()
})
