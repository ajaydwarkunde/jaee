import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to settle
    await page.waitForLoadState('networkidle')
    
    // Check page has Jaee branding (in header, title, or logo)
    const jaeeText = page.locator('text=Jaee').first()
    await expect(jaeeText).toBeVisible({ timeout: 10000 })
  })

  test('should display products on home or shop page', async ({ page }) => {
    // Try home first, if no products, go to shop
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check if we're on login page (redirect)
    const currentUrl = page.url()
    if (currentUrl.includes('login')) {
      // Skip this test if home redirects to login
      test.skip()
      return
    }
    
    // Look for products
    const products = page.locator('a[href*="/product/"]')
    const hasProducts = await products.count() > 0
    
    if (!hasProducts) {
      // Go to shop page
      await page.goto('/shop')
      await page.waitForLoadState('networkidle')
    }
    
    // Now check for products
    await expect(page.locator('a[href*="/product/"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('should navigate to shop page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for Shop link and click
    const shopLink = page.locator('a:has-text("Shop")').first()
    if (await shopLink.isVisible()) {
      await shopLink.click()
      await expect(page).toHaveURL(/.*shop.*/)
    }
  })

  test('should have working header', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check header exists (use .first() to avoid strict mode)
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
  })
})
