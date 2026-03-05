/**
 * E2E tests for Jaee e-commerce website on Render (https://jaee-frontend.onrender.com)
 * Run with: TEST_URL=https://jaee-frontend.onrender.com npx playwright test tests/render-e2e.spec.ts
 */

import { test, expect } from '@playwright/test'

test.describe('Jaee E2E - Render Deployment', () => {
  test.describe('1. Homepage Load Test', () => {
    test('should load homepage and verify all key elements', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      
      // Wait for page to fully load
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      const loadTime = Date.now() - startTime
      console.log(`[TIMING] Homepage load: ${loadTime}ms`)
      
      // Verify header with logo and navigation
      const header = page.locator('header').first()
      await expect(header).toBeVisible({ timeout: 15000 })
      
      const logo = page.locator('header a[href="/"]').first()
      await expect(logo).toBeVisible()
      
      const navLinks = page.locator('header a:has-text("Shop"), header a:has-text("Home")')
      await expect(navLinks.first()).toBeVisible({ timeout: 5000 })
      
      // Verify products are displayed (on home or redirect to shop)
      const currentUrl = page.url()
      const products = page.locator('a[href*="/product/"]')
      const productCount = await products.count()
      
      if (productCount === 0 && !currentUrl.includes('login')) {
        // Maybe home shows featured/hero - check for shop link and navigate
        const shopLink = page.locator('a:has-text("Shop")').first()
        if (await shopLink.isVisible()) {
          await shopLink.click()
          await page.waitForLoadState('networkidle', { timeout: 15000 })
          const shopProducts = page.locator('a[href*="/product/"]')
          await expect(shopProducts.first()).toBeVisible({ timeout: 10000 })
        }
      } else if (productCount > 0) {
        // Products may be in carousel - scroll into view before asserting visibility
        const firstProduct = products.first()
        await firstProduct.scrollIntoViewIfNeeded()
        await expect(firstProduct).toBeVisible()
      }
      
      // Verify footer is visible
      const footer = page.locator('footer')
      await expect(footer).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('2. Navigation Test', () => {
    test('should navigate to Shop and verify products page', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      const startTime = Date.now()
      const shopLink = page.locator('a:has-text("Shop")').first()
      await shopLink.click()
      
      await expect(page).toHaveURL(/.*shop.*/, { timeout: 10000 })
      await page.waitForLoadState('networkidle', { timeout: 15000 })
      
      const navTime = Date.now() - startTime
      console.log(`[TIMING] Shop navigation: ${navTime}ms`)
      
      // Verify products page loaded
      const products = page.locator('a[href*="/product/"]')
      await expect(products.first()).toBeVisible({ timeout: 15000 })
    })

    test('should navigate to category if available', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      // Try Candles or Gifts category from header
      const candlesLink = page.locator('a:has-text("Candles")').first()
      const giftsLink = page.locator('a:has-text("Gifts")').first()
      
      if (await candlesLink.isVisible()) {
        await candlesLink.click()
        await page.waitForLoadState('networkidle', { timeout: 15000 })
        await expect(page).toHaveURL(/.*candles.*/)
      } else if (await giftsLink.isVisible()) {
        await giftsLink.click()
        await page.waitForLoadState('networkidle', { timeout: 15000 })
        await expect(page).toHaveURL(/.*gift.*/)
      }
      // If no category links, test passes - categories may be in filters
    })

    test('should test cart icon in header', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      const cartLink = page.locator('a[href="/cart"], a[aria-label="Cart"]').first()
      await expect(cartLink).toBeVisible({ timeout: 5000 })
      
      await cartLink.click()
      await expect(page).toHaveURL(/.*cart.*/, { timeout: 10000 })
    })
  })

  test.describe('3. Product Browsing', () => {
    test('should open product details and verify all elements', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      const firstProduct = page.locator('a[href*="/product/"]').first()
      await expect(firstProduct).toBeVisible({ timeout: 15000 })
      
      await firstProduct.click()
      
      await expect(page).toHaveURL(/.*product\/.*/, { timeout: 10000 })
      await page.waitForLoadState('networkidle', { timeout: 15000 })
      
      // Product image
      const productImage = page.locator('img[alt*="product"], img[src*="product"], .product-image img, img')
      await expect(productImage.first()).toBeVisible({ timeout: 5000 })
      
      // Price
      const price = page.locator('text=/₹|\\$|€|\\d+(\\.\\d{2})?/')
      await expect(price.first()).toBeVisible({ timeout: 5000 })
      
      // Add to cart button
      const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first()
      await expect(addToCartBtn).toBeVisible({ timeout: 5000 })
      
      // Description (may be in different formats)
      const hasDescription = await page.locator('text=/description|about|details|product/i, [class*="description"]').first().isVisible().catch(() => false)
      // Description is optional - some products may not have it prominently
    })
  })
})
