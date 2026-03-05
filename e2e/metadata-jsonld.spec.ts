import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function getJsonLdPayloadByType(page: Page, type: string) {
  const scripts = page.locator('script[type="application/ld+json"]')
  const scriptCount = await scripts.count()

  for (let i = 0; i < scriptCount; i += 1) {
    const rawPayload = await scripts.nth(i).textContent()
    if (!rawPayload) continue

    const parsedPayload = JSON.parse(rawPayload) as Record<string, unknown>
    if (parsedPayload['@type'] === type) {
      return parsedPayload
    }
  }

  return null
}

async function openRoute(page: Page, path: string) {
  await page.goto(path, { timeout: 60_000, waitUntil: 'load' })
}

test('work index page exposes canonical metadata and ItemList JSON-LD', async ({ page }) => {
  test.setTimeout(180_000)
  await openRoute(page, '/en/work')

  await expect(page).toHaveTitle('Portfolio | Sebastian Kolbusz')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'A curated collection of high-performance e-commerce platforms, landing pages, and SaaS engineering.'
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.kolbusz.xyz/en/work'
  )

  const itemListPayload = await getJsonLdPayloadByType(page, 'ItemList')

  expect(itemListPayload).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
  })
  expect(itemListPayload?.itemListElement).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        '@type': 'ListItem',
        position: 1,
        name: 'Zakofy',
        url: 'https://www.kolbusz.xyz/en/work/zakofy',
      }),
    ])
  )
})

test('project detail page exposes canonical metadata and CreativeWork JSON-LD', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await openRoute(page, '/en/work/zakofy')

  await expect(page).toHaveTitle('Zakofy | Sebastian Kolbusz')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Premium Tatra Mountain Booking Engine'
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.kolbusz.xyz/en/work/zakofy'
  )

  const creativeWorkPayload = await getJsonLdPayloadByType(page, 'CreativeWork')

  expect(creativeWorkPayload).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: 'Zakofy',
    url: 'https://www.kolbusz.xyz/en/work/zakofy',
  })
})
