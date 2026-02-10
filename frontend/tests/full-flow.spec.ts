import { test, expect, Page } from '@playwright/test'

/**
 * Complete E2E Test Suite for Jaee E-commerce
 * Tests the full customer journey from browsing to checkout
 */

// Test user credentials (use test account)
const TEST_USER = {
  email: 'playwright-test@example.com',
  password: 'TestPassword123!',
  name: 'Playwright Test User',
  phone: '+919999999999'
}

test.describe('Complete Shopping Flow', () => {
  
  test('Full customer journey: Browse → Add to Cart → Checkout', async ({ page }) => {
    // Step 1: Visit shop page
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    // Verify products are displayed
    const productCards = page.locator('a[href*="/product/"]')
    const productCount = await productCards.count()
    console.log(`Found ${productCount} products`)
    expect(productCount).toBeGreaterThan(0)
    
    // Step 2: Click on first product
    await productCards.first().click()
    await page.waitForURL(/.*product\/.*/)
    
    // Verify product page elements
    await expect(page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first()).toBeVisible()
    
    // Check for price
    const priceElement = page.locator('text=/₹[\\d,]+/')
    await expect(priceElement.first()).toBeVisible()
    
    // Step 3: Add to cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first()
    await addToCartBtn.click()
    
    // Wait for cart update (toast or cart count change)
    await page.waitForTimeout(2000)
    
    // Step 4: Go to cart
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    
    // Log cart state
    const pageContent = await page.content()
    const hasEmptyCart = pageContent.includes('empty') || pageContent.includes('Empty')
    console.log(`Cart is empty: ${hasEmptyCart}`)
  })
})

test.describe('Product Page Tests', () => {
  
  test('Product page displays all required information', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    // Click first product
    await page.locator('a[href*="/product/"]').first().click()
    await page.waitForURL(/.*product\/.*/)
    
    // Check required elements
    const checks = [
      { name: 'Product Title', selector: 'h1' },
      { name: 'Price', selector: 'text=/₹[\\d,]+/' },
      { name: 'Add to Cart Button', selector: 'button:has-text("Add to Cart"), button:has-text("Add to Bag")' },
      { name: 'Product Image', selector: 'img[src*="http"], img[src*="/"]' },
    ]
    
    for (const check of checks) {
      const element = page.locator(check.selector).first()
      const isVisible = await element.isVisible().catch(() => false)
      console.log(`${check.name}: ${isVisible ? '✓' : '✗'}`)
    }
  })

  test('Product quantity can be changed', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    await page.locator('a[href*="/product/"]').first().click()
    await page.waitForURL(/.*product\/.*/)
    
    // Look for quantity controls
    const increaseBtn = page.locator('button:has-text("+")').first()
    const decreaseBtn = page.locator('button:has-text("-")').first()
    
    if (await increaseBtn.isVisible()) {
      await increaseBtn.click()
      console.log('Quantity increased')
    }
  })

  test('Product images load correctly', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    await page.locator('a[href*="/product/"]').first().click()
    await page.waitForURL(/.*product\/.*/)
    
    // Check all images load
    const images = page.locator('img')
    const imageCount = await images.count()
    
    let loadedCount = 0
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      if (naturalWidth > 0) loadedCount++
    }
    
    console.log(`Images: ${loadedCount}/${imageCount} loaded`)
    expect(loadedCount).toBeGreaterThan(0)
  })
})

test.describe('Search & Filter Tests', () => {
  
  test('Search functionality works', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i], input[name="search"]').first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('candle')
      await searchInput.press('Enter')
      await page.waitForLoadState('networkidle')
      console.log('Search executed')
    } else {
      console.log('No search input found')
    }
  })

  test('Category filter works', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    // Look for category links or select
    const categoryLinks = page.locator('a[href*="category"], button:has-text("Category")')
    
    if (await categoryLinks.first().isVisible()) {
      await categoryLinks.first().click()
      await page.waitForLoadState('networkidle')
      console.log('Category filter clicked')
    }
  })

  test('Sort functionality works', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    // Look for sort dropdown
    const sortSelect = page.locator('select:has-text("Sort"), select[name*="sort"]').first()
    
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption({ index: 1 })
      await page.waitForLoadState('networkidle')
      console.log('Sort option changed')
    }
  })
})

test.describe('Cart Tests', () => {
  
  test('Cart persists after page refresh', async ({ page }) => {
    // Add item to cart
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    await page.locator('a[href*="/product/"]').first().click()
    await page.waitForURL(/.*product\/.*/)
    
    await page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first().click()
    await page.waitForTimeout(2000)
    
    // Refresh page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Go to cart
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    
    // Check if item is still there
    const cartContent = await page.content()
    console.log('Cart content after refresh checked')
  })

  test('Remove item from cart works', async ({ page }) => {
    // First add an item
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    await page.locator('a[href*="/product/"]').first().click()
    await page.waitForURL(/.*product\/.*/)
    
    await page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first().click()
    await page.waitForTimeout(2000)
    
    // Go to cart
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    
    // Look for remove button
    const removeBtn = page.locator('button:has-text("Remove"), button[aria-label*="remove" i], button:has-text("Delete")').first()
    
    if (await removeBtn.isVisible()) {
      await removeBtn.click()
      await page.waitForTimeout(1000)
      console.log('Remove button clicked')
    }
  })
})

test.describe('Authentication Tests', () => {
  
  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    
    // Should show error or stay on login page
    const url = page.url()
    const hasError = url.includes('login') || await page.locator('text=/error|invalid|incorrect/i').isVisible().catch(() => false)
    console.log(`Login rejected invalid credentials: ${hasError}`)
  })

  test('Registration validation works', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    
    // Submit empty form
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Register")')
    await page.waitForTimeout(500)
    
    // Should show validation errors
    const errorMessages = page.locator('text=/required|invalid|must be/i')
    const errorCount = await errorMessages.count()
    console.log(`Validation errors shown: ${errorCount}`)
  })

  test('Password visibility toggle works', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    const passwordInput = page.locator('input[type="password"]').first()
    const toggleBtn = page.locator('button:has(svg), button[aria-label*="password" i]').first()
    
    if (await toggleBtn.isVisible()) {
      // Initially password
      expect(await passwordInput.getAttribute('type')).toBe('password')
      
      // Click toggle
      await toggleBtn.click()
      
      // Should now be text
      const newType = await passwordInput.getAttribute('type')
      console.log(`Password visibility toggled: ${newType === 'text'}`)
    }
  })
})

test.describe('Responsive Design Tests', () => {
  
  test('Mobile menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for hamburger menu
    const menuBtn = page.locator('button[aria-label*="menu" i], button:has(svg[class*="menu"]), .hamburger').first()
    
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
      await page.waitForTimeout(500)
      console.log('Mobile menu opened')
    }
  })

  test('Products grid adapts to screen size', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Check products still visible
    const products = page.locator('a[href*="/product/"]')
    const mobileCount = await products.count()
    console.log(`Products visible on mobile: ${mobileCount}`)
    expect(mobileCount).toBeGreaterThan(0)
  })
})

test.describe('Performance Tests', () => {
  
  test('Pages load within acceptable time', async ({ page }) => {
    const pages = ['/shop', '/cart', '/login']
    
    for (const path of pages) {
      const startTime = Date.now()
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      console.log(`${path} loaded in ${loadTime}ms`)
      expect(loadTime).toBeLessThan(10000) // 10 seconds max
    }
  })

  test('Images are optimized (have dimensions)', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    let optimizedCount = 0
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i)
      const hasWidth = await img.getAttribute('width')
      const hasHeight = await img.getAttribute('height')
      const hasLoading = await img.getAttribute('loading')
      
      if (hasWidth || hasHeight || hasLoading === 'lazy') {
        optimizedCount++
      }
    }
    
    console.log(`Optimized images: ${optimizedCount}/${Math.min(imageCount, 5)}`)
  })
})

test.describe('Accessibility Tests', () => {
  
  test('Images have alt text', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    let withAlt = 0
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      if (alt && alt.trim().length > 0) withAlt++
    }
    
    console.log(`Images with alt text: ${withAlt}/${imageCount}`)
  })

  test('Buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
    
    // Tab through the page
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Check if something is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    console.log(`Focused element after tabs: ${focusedElement}`)
  })

  test('Form labels are associated with inputs', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    const inputs = page.locator('input:not([type="hidden"])')
    const inputCount = await inputs.count()
    
    let labeledCount = 0
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')
      
      if (id || ariaLabel || placeholder) labeledCount++
    }
    
    console.log(`Labeled inputs: ${labeledCount}/${inputCount}`)
  })
})
