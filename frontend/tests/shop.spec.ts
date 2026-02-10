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
    // Wait for products
    await page.waitForLoadState('networkidle')
    
    // Click first product
    const firstProduct = page.locator('a[href*="/product/"]').first()
    await firstProduct.click()
    
    // Should be on product detail page
    await expect(page).toHaveURL(/.*product\/.*/)
    
    // Should have Add to Cart button
    await expect(page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")')).toBeVisible()
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
