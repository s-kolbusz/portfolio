import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function openRoute(page: Page, path: string) {
  await page.request.get(path, { timeout: 120_000 })
  await page.goto(path, { timeout: 60_000, waitUntil: 'networkidle' })
}

// Client work moved to stronypodhale.pl (SEB-20, SEB-21): its old case-study URLs
// hand their signal over with a 301 instead of answering 404.
test('old case-study URLs of client work redirect to stronypodhale.pl', async ({ page }) => {
  const moved = [
    ['/en/projects/zakofy', 'https://stronypodhale.pl/strona-firmowa/'],
    ['/pl/projects/your-krakow-travel', 'https://stronypodhale.pl/strona-firmowa/'],
    ['/en/projects/wellezza', 'https://stronypodhale.pl/#realizacje'],
    ['/pl/projects/billboard-zakopane', 'https://stronypodhale.pl/strona-firmowa/'],
  ] as const

  for (const [path, destination] of moved) {
    const response = await page.request.get(path, { maxRedirects: 0, timeout: 120_000 })

    expect(response.status(), path).toBe(301)
    expect(response.headers()['location'], path).toBe(destination)
  }
})

test('client work on the projects page links out to stronypodhale.pl', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 900, height: 1200 })
  await openRoute(page, '/en/projects')

  const zakofyLink = page.getByRole('link', { name: /zakofy/i }).first()
  await expect(zakofyLink).toHaveAttribute('href', 'https://stronypodhale.pl/strona-firmowa/')
  await expect(zakofyLink).toHaveAttribute('target', '_blank')
})
