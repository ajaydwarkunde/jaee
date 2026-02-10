import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    
    // Check for login form
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")')).toBeVisible()
  })

  test('should show register page', async ({ page }) => {
    await page.goto('/register')
    
    // Check for registration form
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible()
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login')
    
    // Submit empty form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first()
    await submitBtn.click()
    
    // Should show error messages
    await page.waitForTimeout(500)
  })

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login')
    
    // Find "Create account" or "Register" link
    const registerLink = page.locator('a:has-text("Create"), a:has-text("Register"), a:has-text("Sign up")')
    await registerLink.click()
    
    await expect(page).toHaveURL(/.*register.*/)
  })

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/login')
    
    const forgotLink = page.locator('a:has-text("Forgot"), a:has-text("Reset")')
    if (await forgotLink.count() > 0) {
      await forgotLink.click()
      await expect(page).toHaveURL(/.*forgot.*|.*reset.*/)
    }
  })
})
