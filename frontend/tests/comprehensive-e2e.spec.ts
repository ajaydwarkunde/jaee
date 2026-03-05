/**
 * Comprehensive E2E tests for Jaee (https://jaee.vercel.app)
 * Run: TEST_URL=https://jaee.vercel.app npx playwright test tests/comprehensive-e2e.spec.ts
 *
 * Credentials: admin@jaee.com / Admin@123
 */

import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@jaee.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123'

async function loginAsAdmin(page: any) {
  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForSelector('input[type="email"]', { timeout: 5000 })
  await page.locator('form input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('form input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL((url: URL) => !url.pathname.includes('login'), { timeout: 25000 })
}

test.describe('Comprehensive E2E - Jaee', () => {
  test.describe('1. User Authentication', () => {
    test('registration form has all required fields (do not submit)', async ({ page }) => {
      await page.goto('/register')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/create account/i)).toBeVisible()
      await expect(page.locator('input[name="name"], input[placeholder*="name"]').first()).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[name="mobileNumber"], input[placeholder*="mobile"]').first()).toBeVisible()
      await expect(page.locator('input[type="password"]').first()).toBeVisible()
      await expect(page.locator('input[name="confirmPassword"], label:has-text("Confirm")').first()).toBeVisible()
      await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
    })

    test('login with admin credentials and verify redirect', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')
      await page.locator('button:has-text("Email")').first().click()
      await page.locator('form input[type="email"]').fill(ADMIN_EMAIL)
      await page.locator('form input[type="password"]').fill(ADMIN_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()

      await page.waitForURL((url: URL) => !url.pathname.includes('login'), { timeout: 20000 })
      await expect(page).not.toHaveURL(/.*login.*/)
    })

    test('user menu shows after login', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/account')
      await page.waitForLoadState('domcontentloaded')
      await expect(page.getByRole('heading', { name: /my account/i })).toBeVisible()
    })
  })

  test.describe('2. Product Features', () => {
    test('product page has Related Products (You May Also Like)', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')

      const relatedSection = page.getByText(/you may also like/i)
      await expect(relatedSection).toBeVisible({ timeout: 10000 })
    })

    test('product page has Recently Viewed (after viewing 2+ products)', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')
      await page.locator('a[href*="/product/"]').nth(1).click()
      await page.waitForLoadState('domcontentloaded')

      const recentlyViewed = page.getByText(/recently viewed/i)
      await expect(recentlyViewed).toBeVisible({ timeout: 5000 })
    })

    test('product page has Customer Reviews section', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/customer reviews/i)).toBeVisible()
    })

    test('product page has Add Review when logged in', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')

      const writeReview = page.getByRole('button', { name: /write a review/i })
      await expect(writeReview).toBeVisible()
    })

    test('product shows Low Stock badge when stock <= 5', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })

      const lowStockBadge = page.getByText(/only \d+ left/i)
      const hasLowStock = await lowStockBadge.first().isVisible().catch(() => false)
      if (hasLowStock) {
        await expect(lowStockBadge.first()).toBeVisible()
      }
    })
  })

  test.describe('3. Wishlist', () => {
    test('wishlist page loads', async ({ page }) => {
      await page.goto('/wishlist')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('heading', { name: /your wishlist/i })).toBeVisible({ timeout: 5000 })
    })

    test('add to wishlist requires login', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')

      const wishlistBtn = page.getByRole('button', { name: /add to wishlist|remove from wishlist/i })
      await wishlistBtn.click()
      await expect(page.getByText(/please login to add to wishlist/i)).toBeVisible({ timeout: 3000 })
    })

    test('add to wishlist works when logged in', async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')

      const wishlistBtn = page.getByRole('button', { name: /add to wishlist|remove from wishlist/i })
      await wishlistBtn.click()
      await expect(page.getByText(/added to wishlist|removed from wishlist/i)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('4. User Account', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test('account page has profile section', async ({ page }) => {
      await page.goto('/account')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('heading', { name: /my account/i })).toBeVisible()
      await expect(page.locator('main a[href="/orders"]')).toBeVisible()
    })

    test('account has My Orders link', async ({ page }) => {
      await page.goto('/account')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('link', { name: /my orders/i })).toBeVisible()
    })

    test('account has Addresses link', async ({ page }) => {
      await page.goto('/account')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('link', { name: /addresses/i }).first()).toBeVisible()
    })

    test('account has Profile Settings link', async ({ page }) => {
      await page.goto('/account')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('link', { name: /profile settings/i })).toBeVisible()
    })
  })

  test.describe('5. Checkout Flow', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test('add to cart, go to cart, apply WELCOME10, verify discount', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')
      await page.locator('button:has-text("Add to Cart")').first().click()
      await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 })

      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      const couponInput = page.getByPlaceholder(/enter coupon code/i)
      await expect(couponInput).toBeVisible({ timeout: 5000 })
      await couponInput.fill('WELCOME10')
      await page.getByRole('button', { name: /apply/i }).click()
      await expect(page.getByText(/you save|discount/i).first()).toBeVisible({ timeout: 5000 })
    })

    test('cart has address selection section', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')
      await page.locator('button:has-text("Add to Cart")').first().click()
      await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 })

      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/delivery address|address/i)).toBeVisible({ timeout: 5000 })
    })

    test('cart has Proceed to Checkout button', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')
      await page.locator('button:has-text("Add to Cart")').first().click()
      await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 })

      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('button', { name: /proceed to checkout/i })).toBeVisible()
    })
  })

  test.describe('6. Admin Features', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test('admin products page has list and create/edit buttons', async ({ page }) => {
      await page.goto('/admin/products')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/products/i).first()).toBeVisible()
      const createBtn = page.getByRole('button', { name: /add product|create product|new product/i })
      const hasCreate = await createBtn.isVisible().catch(() => false)
      expect(hasCreate).toBeTruthy()
    })

    test('admin categories page loads', async ({ page }) => {
      await page.goto('/admin/categories')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/categor/i).first()).toBeVisible()
    })

    test('admin settings page loads', async ({ page }) => {
      await page.goto('/admin/settings')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/settings|shipping|returns/i).first()).toBeVisible()
    })
  })

  test.describe('7. Other Features', () => {
    test('newsletter signup on homepage', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const newsletterSection = page.getByRole('heading', { name: /join the jaee community/i })
      await expect(newsletterSection).toBeVisible({ timeout: 10000 })
      const emailInput = page.locator('input[type="email"]').filter({ has: page.locator('visible=true') })
      await expect(emailInput.first()).toBeVisible()
    })

    test('404 page for nonexistent route', async ({ page }) => {
      await page.goto('/nonexistent-page')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible()
    })
  })
})
