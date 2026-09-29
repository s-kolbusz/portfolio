import { expect, test } from '@playwright/test'

test.describe('Print Calculator accessibility', () => {
  test('calculator form has accessible controls', async ({ page }) => {
    await page.goto('/en')

    // Scroll to calculator
    const calculator = page.locator('#calculator')
    await calculator.scrollIntoViewIfNeeded()

    // Verify sliders/inputs have labels and are keyboard reachable
    // In this implementation, they are custom Slider components with <input type="range">
    const widthInput = page.getByLabel(/width/i)
    await expect(widthInput).toBeVisible()
    await expect(widthInput).toHaveAttribute('type', 'range')

    const heightInput = page.getByLabel(/height/i)
    await expect(heightInput).toBeVisible()
    await expect(heightInput).toHaveAttribute('type', 'range')

    // Check results are updated when slider changes
    const priceDisplay = page.locator('#calculator .font-serif.text-6xl')
    const initialPrice = await priceDisplay.textContent()

    // Change a slider value. The calculator is loaded lazily, so a fill that
    // lands before hydration changes the input but not React state, and
    // refilling the same value then fires no change. Each attempt moves the
    // slider away and back, until the hydrated component reacts.
    await expect(async () => {
      await widthInput.fill('1')
      await widthInput.fill('20')
      await expect(priceDisplay).not.toHaveText(initialPrice ?? '', { timeout: 1000 })
    }).toPass({ timeout: 15_000 })
  })
})
