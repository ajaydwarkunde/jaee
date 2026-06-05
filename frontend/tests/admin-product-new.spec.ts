import { test, expect } from '@playwright/test'

const API_URL = process.env.API_URL || 'https://jaee-backend.onrender.com'
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@jaee.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'Admin@123'

async function seedAdminSession(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext) {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  expect(response.ok()).toBeTruthy()

  const body = await response.json()
  const { accessToken, refreshToken, user } = body.data

  await page.addInitScript(
    ({ authState }) => {
      localStorage.setItem('jaai-auth', JSON.stringify({ state: authState, version: 0 }))
    },
    {
      authState: {
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
      },
    }
  )
}

test.describe('Admin new product page', () => {
  test('shows Add Product form instead of Product not found', async ({ page, request }) => {
    await seedAdminSession(page, request)
    await page.goto('/admin/products/new')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: /add product/i })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(/^Product not found$/)).not.toBeVisible()
  })
})
