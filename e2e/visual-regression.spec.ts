import { expect, test } from '@playwright/test'

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    // Disable smooth scroll and heavy animations for consistent screenshots
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  // The redesigned home page is a long run of pinned canvas scenes: a full-page screenshot of it
  // times out and shows no real state. Its contact section is static, so that is what is compared.
  test('home contact section matches baseline', async ({ page }) => {
    await page.goto('/en')
    await page.evaluate(() => document.fonts.ready)
    const contact = page.locator('#contact')
    await contact.scrollIntoViewIfNeeded()
    await expect(contact.getByText('office')).toBeVisible()
    await page.waitForTimeout(1000)

    await expect(contact).toHaveScreenshot('home-contact-en.png', {
      timeout: 30000,
      maxDiffPixelRatio: 0.02,
    })
  })

  test('cv page matches baseline', async ({ page }) => {
    await page.goto('/en/cv')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.addStyleTag({
      content: `
        #page-transition-container { opacity: 1 !important; visibility: visible !important; }
        main *, section, section * { opacity: 1 !important; visibility: visible !important; transform: none !important; }
      `,
    })

    await expect(page).toHaveScreenshot('cv-en.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.1,
    })
  })

  test('project book matches baseline', async ({ page }) => {
    await page.goto('/en/projects')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.addStyleTag({
      content:
        '#page-transition-container { opacity: 1 !important; visibility: visible !important; }',
    })

    await expect(page).toHaveScreenshot('project-book-en.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.1,
    })
  })
})
