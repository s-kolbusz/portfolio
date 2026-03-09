import { expect, test } from '@playwright/test'

test.describe('visual regression', () => {
  test.beforeEach(async ({ page }) => {
    // Disable smooth scroll and heavy animations for consistent screenshots
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('homepage matches baseline', async ({ page }) => {
    await page.goto('/en')
    await page.evaluate(() => document.fonts.ready)

    // Force visibility of elements and HIDE dynamic canvas
    await page.addStyleTag({
      content: `
        #page-transition-container { 
          opacity: 1 !important; 
          transform: none !important; 
          filter: none !important; 
          visibility: visible !important;
        }
        .char { opacity: 1 !important; transform: none !important; visibility: visible !important; }
        .hero-cta { opacity: 1 !important; transform: none !important; visibility: visible !important; }
        canvas { display: none !important; }
        
        /* Force all elements that might be animated by useTimeline to be visible */
        main *, section, section * { 
          opacity: 1 !important; 
          transform: none !important; 
          visibility: visible !important;
          filter: none !important;
          clip-path: none !important;
          pointer-events: auto !important;
        }

        /* Ensure smooth scroller doesn't interfere with fullPage screenshot */
        html, body {
          overflow: visible !important;
          height: auto !important;
        }
      `,
    })

    // Scroll to the bottom to trigger any lazy loading or scroll-based logic
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight)
      await new Promise((r) => setTimeout(r, 500))
      window.scrollTo(0, 0)
    })

    // Wait for everything to settle
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verify some non-hero content is visible before taking screenshot
    await expect(page.locator('#about')).toBeVisible()
    await expect(page.locator('#projects')).toBeVisible()

    await expect(page).toHaveScreenshot('homepage-en.png', {
      fullPage: true,
      timeout: 30000,
      maxDiffPixelRatio: 0.1,
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
