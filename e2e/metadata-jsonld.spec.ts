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
  await page.request.get(path, { timeout: 120_000 })
  await page.goto(path, { timeout: 60_000, waitUntil: 'domcontentloaded' })
}

test('projects index page exposes canonical metadata and ItemList JSON-LD', async ({ page }) => {
  test.setTimeout(180_000)
  await openRoute(page, '/en/projects')

  await expect(page).toHaveTitle('Selected Work | Sebastian Kolbusz')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Selected case studies covering high-performance websites, SaaS interfaces, and digital platforms built with clarity, speed, and measurable outcomes.'
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://kolbusz.xyz/en/projects'
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
        // Client work is described on stronypodhale.pl, so the list points there.
        url: 'https://stronypodhale.pl/strona-firmowa/',
      }),
    ])
  )
})

test('project detail page exposes canonical metadata and CreativeWork JSON-LD', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await openRoute(page, '/en/projects/ready2order')

  await expect(page).toHaveTitle('ready2order | Sebastian Kolbusz')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Senior Frontend Engineer — Enterprise POS. Optimizing and scaling cross-platform POS software used by thousands of businesses across Europe.'
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://kolbusz.xyz/en/projects/ready2order'
  )

  const creativeWorkPayload = await getJsonLdPayloadByType(page, 'CreativeWork')

  expect(creativeWorkPayload).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: 'ready2order',
    url: 'https://kolbusz.xyz/en/projects/ready2order',
  })
})
