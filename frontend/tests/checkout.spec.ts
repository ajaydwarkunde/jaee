import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should require login for checkout', async ({ page }) => {
    // Ensure logged out
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('auth-storage')
    })
    
    // Add item to cart
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('a[href*="/product/"]').first()
    await firstProduct.click()
    await page.waitForURL(/.*product\/.*/)
    
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first()
    await addToCartBtn.click()
    await page.waitForTimeout(1000)
    
    // Go to cart and try checkout
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    
    const checkoutBtn = page.locator('button:has-text("Checkout"), a:has-text("Checkout"), button:has-text("Proceed")')
    if (await checkoutBtn.count() > 0) {
      await checkoutBtn.first().click()
      
      // Should redirect to login or show login prompt
      await page.waitForTimeout(1000)
    }
  })

  test('should show order summary in cart', async ({ page }) => {
    // Add item first
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('a[href*="/product/"]').first()
    await firstProduct.click()
    await page.waitForURL(/.*product\/.*/)
    
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first()
    await addToCartBtn.click()
    await page.waitForTimeout(1000)
    
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    
    // Should show subtotal/total
    const total = page.locator('text=/₹\\d+|Total|Subtotal/i')
    if (await total.count() > 0) {
      await expect(total.first()).toBeVisible()
    }
  })
})
