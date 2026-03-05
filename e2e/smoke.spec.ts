import { expect, test } from '@playwright/test'

test('redirects to the default locale and renders the hero heading', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/en\/?$/)
  await expect(page.getByRole('heading', { level: 1, name: /sebastian kolbusz/i })).toBeVisible()
})

test('renders localized hero content for Polish locale', async ({ page }) => {
  await page.goto('/pl')

  await expect(page).toHaveURL(/\/pl\/?$/)
  await expect(page.getByRole('heading', { level: 2, name: /architekt frontend/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /poznaj mój warsztat/i })).toBeVisible()
})
