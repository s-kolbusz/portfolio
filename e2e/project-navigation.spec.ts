import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { isStudioCase } from '../src/data/entry-href'
import { externalProjectRedirects } from '../src/data/project-redirects'
import { portfolioEntries } from '../src/data/projects'

async function openRoute(page: Page, path: string) {
  await page.request.get(path, { timeout: 120_000 })
  await page.goto(path, { timeout: 60_000, waitUntil: 'networkidle' })
}

// Client work moved to stronypodhale.pl (SEB-20, SEB-21): every configured old
// case-study URL hands its signal over with a single 301 instead of a 404.
test('old case-study URLs of client work redirect to stronypodhale.pl', async ({ page }) => {
  for (const { source, destination } of externalProjectRedirects()) {
    const response = await page.request.get(source, { maxRedirects: 0, timeout: 120_000 })

    expect(response.status(), source).toBe(301)
    expect(response.headers()['location'], source).toBe(destination)
  }
})

test('client work on the projects page links out to stronypodhale.pl', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 900, height: 1200 })
  await openRoute(page, '/en/projects')

  const [studioCase] = portfolioEntries.filter(isStudioCase)
  const link = page.getByRole('link', { name: new RegExp(studioCase.id.replace(/-/g, ' '), 'i') })

  await expect(link.first()).toHaveAttribute('href', studioCase.studioCaseUrl)
  await expect(link.first()).toHaveAttribute('target', '_blank')
})
