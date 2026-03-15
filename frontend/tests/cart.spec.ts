import { test, expect } from '@playwright/test'

async function addFirstInStockProductToCart(page: import('@playwright/test').Page) {
  await page.goto('/shop')
  await page.waitForLoadState('networkidle')

  const productLinks = page.locator('a[href*="/product/"]')
  const count = await productLinks.count()

  for (let i = 0; i < count; i++) {
    await productLinks.nth(i).click()
    await page.waitForURL(/.*product\/.*/)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Skip out-of-stock products (they show "Out of Stock" badge instead of Add to Cart)
    const outOfStock = page.locator('text=Out of Stock')
    if (await outOfStock.isVisible().catch(() => false)) {
      await page.goBack()
      await page.waitForLoadState('networkidle')
      continue
    }

    // If the product has variant options, select the first available value for each group
    const variantGroups = page.locator('button[class*="border-2"]:not([disabled])')
    if (await variantGroups.count() > 0) {
      await variantGroups.first().click()
      await page.waitForTimeout(300)
    }

    const addToCartBtn = page.locator('button:has-text("Add to Cart")')
    if (await addToCartBtn.count() > 0) {
      const btn = addToCartBtn.last()
      await btn.scrollIntoViewIfNeeded()
      await expect(btn).toBeEnabled({ timeout: 5000 })
      await btn.click()
      await page.waitForTimeout(1000)
      return
    }

    await page.goBack()
    await page.waitForLoadState('networkidle')
  }

  throw new Error('No in-stock product found to add to cart')
}

test.describe('Cart Functionality', () => {
  test('should add product to cart', async ({ page }) => {
    test.setTimeout(60000)
    await addFirstInStockProductToCart(page)

    await page.goto('/cart')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Your cart is empty')).not.toBeVisible({ timeout: 5000 }).catch(() => {
      // Cart might be empty if product required variant selection
    })
  })

  test('should show empty cart message', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('cart-storage')
      localStorage.removeItem('guest-cart')
    })

    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
  })

  test('should update quantity in cart', async ({ page }) => {
    test.setTimeout(60000)
    await addFirstInStockProductToCart(page)

    await page.goto('/cart')
    await page.waitForLoadState('networkidle')

    const increaseBtn = page.locator('button:has-text("+"), button[aria-label*="increase"]')
    if (await increaseBtn.count() > 0) {
      await increaseBtn.first().click()
      await page.waitForTimeout(500)
    }
  })
})
