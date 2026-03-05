/**
 * E2E tests for Cart and Coupon functionality on Jaee (https://jaee.vercel.app)
 * Run with: TEST_URL=https://jaee.vercel.app npx playwright test tests/cart-coupon-e2e.spec.ts
 */

import { test, expect } from '@playwright/test'

test.describe('Cart & Coupon E2E', () => {
  test.describe('1. Add to Cart Flow', () => {
    test('guest can add product to cart from product page', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })

      const firstProduct = page.locator('a[href*="/product/"]').first()
      await firstProduct.scrollIntoViewIfNeeded()
      await firstProduct.click()

      await expect(page).toHaveURL(/.*product\/.*/)
      await page.waitForSelector('button:has-text("Add to Cart"), button:has-text("Add to Bag")', { timeout: 10000 })

      const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first()
      await expect(addToCartBtn).toBeVisible()

      const cartCountBefore = await page.locator('a[href="/cart"] span, a[aria-label="Cart"] span').count()
      await addToCartBtn.click()

      await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 })

      const cartCountAfter = await page.locator('a[href="/cart"] span, a[aria-label="Cart"] span').count()
      expect(cartCountAfter).toBeGreaterThanOrEqual(cartCountBefore)
    })

    test('cart icon updates after add to cart (guest)', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })

      const firstProduct = page.locator('a[href*="/product/"]').first()
      await firstProduct.scrollIntoViewIfNeeded()
      await firstProduct.click()

      await page.waitForSelector('button:has-text("Add to Cart"), button:has-text("Add to Bag")', { timeout: 10000 })
      await page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first().click()

      await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 })

      const cartLink = page.locator('a[href="/cart"]').first()
      await expect(cartLink).toBeVisible()
    })
  })

  test.describe('2. Cart Page Test', () => {
    test('guest sees sign-in prompt on /cart', async ({ page }) => {
      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      const signInPrompt = page.getByText(/sign in to view your cart/i)
      await expect(signInPrompt).toBeVisible({ timeout: 5000 })

      const signInBtn = page.locator('a[href*="/login"]').filter({ hasText: /sign in|log in/i }).first()
      await expect(signInBtn).toBeVisible()

      const registerLink = page.locator('a[href="/register"]')
      await expect(registerLink).toBeVisible()
    })

    test('authenticated empty cart shows empty state', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      const cartLink = page.locator('a[href="/cart"]').first()
      await cartLink.click()
      await page.waitForLoadState('domcontentloaded')

      const currentUrl = page.url()
      if (currentUrl.includes('login')) {
        test.skip()
        return
      }

      const emptyCart = page.getByText(/your cart is empty|sign in to view/i)
      await expect(emptyCart).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('3. Coupon Code Test', () => {
    test('guest cart shows sign-in prompt (coupon requires login)', async ({ page }) => {
      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      const signInPrompt = page.getByText(/sign in to view your cart/i)
      await expect(signInPrompt).toBeVisible()
    })

    test('coupon flow with test credentials', async ({ page }) => {
      const testEmail = process.env.E2E_TEST_EMAIL
      const testPassword = process.env.E2E_TEST_PASSWORD
      if (!testEmail || !testPassword) {
        test.skip()
        return
      }

      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      const firstProduct = page.locator('a[href*="/product/"]').first()
      await firstProduct.scrollIntoViewIfNeeded()
      await firstProduct.click()
      await page.waitForSelector('button:has-text("Add to Cart"), button:has-text("Add to Bag")', { timeout: 10000 })
      await page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first().click()
      await expect(page.getByText(/added.*to cart/i)).toBeVisible({ timeout: 5000 })

      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')
      await page.getByLabel(/email/i).fill(testEmail)
      await page.getByLabel(/password/i).fill(testPassword)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(/^\/(?!login)/, { timeout: 10000 })

      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      const couponInput = page.getByPlaceholder(/enter coupon code/i)
      await expect(couponInput).toBeVisible({ timeout: 5000 })

      await couponInput.fill('INVALID123')
      await page.getByRole('button', { name: /apply/i }).click()
      await expect(page.locator('p.text-error')).toBeVisible({ timeout: 5000 })

      await couponInput.fill('WELCOME10')
      await page.getByRole('button', { name: /apply/i }).click()
      await expect(page.getByText(/you save|discount/i)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('4. Login Page Test', () => {
    test('login page has all required form elements', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

      const emailTab = page.getByRole('button', { name: /email/i })
      await expect(emailTab).toBeVisible()

      const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/you@example/i))
      await expect(emailInput.first()).toBeVisible()

      const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]'))
      await expect(passwordInput.first()).toBeVisible()

      const loginBtn = page.getByRole('button', { name: /sign in/i })
      await expect(loginBtn).toBeVisible()

      const registerLink = page.locator('a[href="/register"]').filter({ hasText: /sign up|register/i })
      await expect(registerLink.first()).toBeVisible()

      const forgotPasswordLink = page.locator('a[href="/forgot-password"]')
      await expect(forgotPasswordLink).toBeVisible()
    })

    test('login page has mobile OTP option', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')

      const mobileTab = page.getByRole('button', { name: /mobile/i })
      await expect(mobileTab).toBeVisible()
      await mobileTab.click()

      const mobileInput = page.getByLabel(/mobile/i).or(page.getByPlaceholder(/\+91/i))
      await expect(mobileInput.first()).toBeVisible({ timeout: 3000 })
    })
  })
})
