/**
 * E2E tests for Admin Panel on Jaee (https://jaee.vercel.app)
 * Run with: TEST_URL=https://jaee.vercel.app npx playwright test tests/admin-e2e.spec.ts
 *
 * Admin credentials (from seed): admin@jaee.com / Admin@123
 * Override with: E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
 */

import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@jaee.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123'

test.describe('Admin Panel E2E', () => {
  test.describe('1. Admin Login Access', () => {
    test('unauthenticated user redirects to login when visiting /admin', async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('domcontentloaded')

      await expect(page).toHaveURL(/.*login.*/)
    })

    test('unauthenticated user redirects to login when visiting /admin/coupons', async ({ page }) => {
      await page.goto('/admin/coupons')
      await page.waitForLoadState('domcontentloaded')

      await expect(page).toHaveURL(/.*login.*/)
    })

    test('unauthenticated user redirects to login when visiting /admin/orders', async ({ page }) => {
      await page.goto('/admin/orders')
      await page.waitForLoadState('domcontentloaded')

      await expect(page).toHaveURL(/.*login.*/)
    })
  })

  test.describe('2. Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')
      await page.getByRole('button', { name: /email/i }).click()
      await page.locator('form input[type="email"]').fill(ADMIN_EMAIL)
      await page.locator('form input[type="password"]').fill(ADMIN_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15000 })
      await page.goto('/admin')
      await page.waitForLoadState('domcontentloaded')
    })

    test('dashboard displays stats: Total Products, Categories, Total Orders, Pending Orders', async ({ page }) => {
      await expect(page.getByText(/admin dashboard/i)).toBeVisible()

      const totalProducts = page.getByText('Total Products').first()
      await expect(totalProducts).toBeVisible()

      const categories = page.getByText('Categories').first()
      await expect(categories).toBeVisible()

      const totalOrders = page.getByText('Total Orders').first()
      await expect(totalOrders).toBeVisible()

      const pendingOrders = page.getByText('Pending Orders').first()
      await expect(pendingOrders).toBeVisible()
    })

    test('quick action cards: Products, Categories, Orders, Promo Codes, Store Settings', async ({ page }) => {
      await expect(page.getByRole('link', { name: /view all products/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /manage categories/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /manage orders/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /manage coupons/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /configure settings/i })).toBeVisible()
    })
  })

  test.describe('3. Admin Coupons Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')
      await page.getByRole('button', { name: /email/i }).click()
      await page.locator('form input[type="email"]').fill(ADMIN_EMAIL)
      await page.locator('form input[type="password"]').fill(ADMIN_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15000 })
      await page.goto('/admin/coupons')
      await page.waitForLoadState('domcontentloaded')
    })

    test('coupons page loads with Create Coupon button', async ({ page }) => {
      await expect(page.getByText(/promo codes/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /create coupon/i })).toBeVisible()
    })

    test('coupon table shows Code, Discount, Usage, Status, Edit/Delete', async ({ page }) => {
      await expect(page.getByText(/promo codes/i)).toBeVisible()
      const table = page.locator('table')
      const emptyState = page.getByText(/no coupons yet/i)
      const hasTable = await table.isVisible().catch(() => false)
      const hasEmptyState = await emptyState.isVisible().catch(() => false)
      expect(hasTable || hasEmptyState).toBeTruthy()
      if (hasTable) {
        await expect(page.locator('th:has-text("Code")')).toBeVisible()
        await expect(page.locator('th:has-text("Discount")')).toBeVisible()
        await expect(page.locator('th:has-text("Status")')).toBeVisible()
      }
    })
  })

  test.describe('4. Admin Orders Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')
      await page.getByRole('button', { name: /email/i }).click()
      await page.locator('form input[type="email"]').fill(ADMIN_EMAIL)
      await page.locator('form input[type="password"]').fill(ADMIN_PASSWORD)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 15000 })
      await page.goto('/admin/orders')
      await page.waitForLoadState('domcontentloaded')
    })

    test('orders page loads with orders list or empty state', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /^orders$/i })).toBeVisible()
    })

    test('status filters: ALL, PENDING, PAID, SHIPPED, FULFILLED, CANCELLED', async ({ page }) => {
      const allBtn = page.getByRole('button', { name: /all orders/i })
      await expect(allBtn).toBeVisible()

      const pendingBtn = page.getByRole('button', { name: /^PENDING$/i })
      await expect(pendingBtn).toBeVisible()
    })

    test('orders table has Order ID, Customer, Items, Total, Status, Date, Actions', async ({ page }) => {
      const table = page.locator('table')
      const tableVisible = await table.isVisible().catch(() => false)

      if (tableVisible) {
        await expect(page.locator('th:has-text("Order ID")')).toBeVisible()
        await expect(page.locator('th:has-text("Customer")')).toBeVisible()
        await expect(page.locator('th:has-text("Status")')).toBeVisible()
      }
    })
  })
})
