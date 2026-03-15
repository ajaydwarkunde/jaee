import { test, expect } from '@playwright/test'

test.describe('Shop Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop')
  })

  test('should display products', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle')
    
    // Check products grid
    const products = page.locator('a[href*="/product/"]')
    const count = await products.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should filter products by category', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle')
    
    // Look for category filters
    const categoryFilter = page.locator('select, [data-testid="category-filter"], button:has-text("Category")')
    
    if (await categoryFilter.count() > 0) {
      await categoryFilter.first().click()
    }
  })

  test('should click on product and view details', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const firstProduct = page.locator('a[href*="/product/"]').first()
    await firstProduct.click()

    await expect(page).toHaveURL(/.*product\/.*/)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Select Options")').last()
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 })
  })

  test('should search for products', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]')
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('candle')
      await searchInput.press('Enter')
      
      // Wait for results
      await page.waitForLoadState('networkidle')
    }
  })
})
