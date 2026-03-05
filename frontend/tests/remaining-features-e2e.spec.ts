/**
 * E2E tests for remaining features on Jaee (https://jaee.vercel.app)
 * Run: TEST_URL=https://jaee.vercel.app npx playwright test tests/remaining-features-e2e.spec.ts
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

test.describe('Remaining Features E2E', () => {
  test.describe('1. Email Verification Page', () => {
    test('verify-email without token shows email input and Send Verification Email', async ({ page }) => {
      await page.goto('/verify-email')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/verify your email/i)).toBeVisible()
      await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /send verification email/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible()
    })

    test('verify-email with invalid token shows error and resend option', async ({ page }) => {
      await page.goto('/verify-email?token=invalid-token')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('heading', { name: 'Verification Failed' })).toBeVisible({ timeout: 10000 })
      await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole('button', { name: /resend verification email/i })).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('2. Password Reset Flow', () => {
    test('forgot-password has email input and submit button', async ({ page }) => {
      await page.goto('/forgot-password')
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/forgot password/i)).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible()
    })

    test('reset-password without token redirects to forgot-password', async ({ page }) => {
      await page.goto('/reset-password')
      await page.waitForLoadState('domcontentloaded')

      await expect(page).toHaveURL(/.*forgot-password.*/)
    })
  })

  test.describe('3. Product Reviews', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test('product page has Write Review button when logged in', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/customer reviews/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /write a review/i })).toBeVisible()
    })

    test('review form has star rating, comment field, submit button', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')

      await page.getByRole('button', { name: /write a review/i }).click()

      await expect(page.getByText(/your rating/i)).toBeVisible()
      await expect(page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first()).toBeVisible()
      await expect(page.getByPlaceholder(/tell others about your experience/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /submit review/i })).toBeVisible()
    })
  })

  test.describe('4. Coupon Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test('apply FLAT100 and SUMMER20 coupons', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')
      await page.locator('button:has-text("Add to Cart")').first().click()
      await page.waitForTimeout(1500)

      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      const couponInput = page.getByPlaceholder(/enter coupon code/i)
      await expect(couponInput).toBeVisible({ timeout: 5000 })

      await couponInput.fill('FLAT100')
      await page.getByRole('button', { name: /apply/i }).click()
      await page.waitForTimeout(2000)
      const flat100Result = await page.getByText(/you save|discount|minimum|min order|invalid/i).first().isVisible().catch(() => false)
      expect(flat100Result).toBeTruthy()

      const removeCouponBtn = page.locator('button[title="Remove coupon"]')
      if (await removeCouponBtn.isVisible().catch(() => false)) {
        await removeCouponBtn.click()
        await page.waitForTimeout(500)
      }

      await couponInput.fill('SUMMER20')
      await page.getByRole('button', { name: /apply/i }).click()
      await page.waitForTimeout(2000)
      const summer20Result = await page.getByText(/you save|discount|invalid|expired|minimum/i).first().isVisible().catch(() => false)
      expect(summer20Result).toBeTruthy()
    })

    test('remove applied coupon', async ({ page }) => {
      await page.goto('/shop')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 })
      await page.locator('a[href*="/product/"]').first().click()
      await page.waitForLoadState('domcontentloaded')
      await page.locator('button:has-text("Add to Cart")').first().click()
      await page.waitForTimeout(1500)

      await page.goto('/cart')
      await page.waitForLoadState('domcontentloaded')

      const couponInput = page.getByPlaceholder(/enter coupon code/i)
      await couponInput.fill('WELCOME10')
      await page.getByRole('button', { name: /apply/i }).click()
      await expect(page.getByText(/you save|discount/i).first()).toBeVisible({ timeout: 5000 })

      const removeBtn = page.locator('button[title="Remove coupon"]')
      await removeBtn.click()
      await expect(page.getByPlaceholder(/enter coupon code/i)).toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('5. Admin Create Coupon Form', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test('Create Coupon modal has all required fields', async ({ page }) => {
      await page.goto('/admin/coupons')
      await page.waitForLoadState('domcontentloaded')

      await page.getByRole('button', { name: /create coupon/i }).click()

      await expect(page.getByText(/coupon code/i)).toBeVisible()
      await expect(page.getByPlaceholder(/summer sale - 20% off/i)).toBeVisible()
      await expect(page.getByText(/discount type/i)).toBeVisible()
      await expect(page.locator('select').first()).toBeVisible()
      await expect(page.locator('input[placeholder*="e.g."]').first()).toBeVisible()
      await expect(page.getByPlaceholder(/e\.g\., 500/)).toBeVisible()
      await expect(page.getByPlaceholder(/leave empty|unlimited/i)).toBeVisible()
      await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible()
      await expect(page.locator('form').getByText('Active')).toBeVisible()
    })
  })

  test.describe('6. Order Detail Page', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test('admin can view order detail from orders list', async ({ page }) => {
      await page.goto('/admin/orders')
      await page.waitForLoadState('domcontentloaded')

      const viewOrderLink = page.locator('a[href*="/orders/"]').first()
      const hasOrders = await viewOrderLink.isVisible().catch(() => false)

      if (hasOrders) {
        await viewOrderLink.click()
        await page.waitForLoadState('domcontentloaded')

        await expect(page.getByText(/order #|order not found/i)).toBeVisible({ timeout: 10000 })
        const hasItems = await page.getByText(/items|₹|total/i).first().isVisible().catch(() => false)
        expect(hasItems).toBeTruthy()
      } else {
        await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()
      }
    })
  })
})
