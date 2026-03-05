# Jaee E2E Test Report: Cart & Coupon Functionality

**Test Date:** February 23, 2026  
**Target:** https://jaee.vercel.app

---

## Executive Summary

| Area | Status | Notes |
|------|--------|-------|
| Add to Cart Flow (Guest) | ✅ Pass | No login required |
| Cart Page (Guest) | ✅ Pass | Shows sign-in prompt |
| Coupon Code | ⚠️ Requires Login | Coupon UI only for authenticated users |
| Login Page | ✅ Pass | All form elements present |

---

## 1. Add to Cart Flow

### Findings

| Test | Result |
|------|--------|
| Guest can add product from product page | ✅ **Works** – No login required |
| Cart icon updates after add | ✅ **Works** – Badge count increases |
| Toast confirmation | ✅ **Works** – "Added X item(s) to cart!" |

**Behavior:**
- **Guest users:** Add to Cart uses localStorage (guest cart). No login required.
- **Authenticated users:** Add to Cart uses API; cart is stored server-side.
- Cart count in header updates immediately for both.

---

## 2. Cart Page Test

### Guest User (Not Logged In)

| Element | Status |
|---------|--------|
| Page loads at /cart | ✅ |
| "Sign in to view your cart" message | ✅ Visible |
| Sign In button | ✅ Links to /login with `from: /cart` |
| Create Account link | ✅ Links to /register |
| Continue Shopping link | ✅ Links to /shop |

**Note:** Guests cannot see cart items or coupon input. They must sign in to view and manage cart.

### Authenticated User (Logged In)

When logged in with items in cart, the cart page shows:
- **Item display** – Product image, name, price, quantity
- **Quantity controls** – +/- buttons
- **Remove button** – Trash icon per item
- **Subtotal calculation** – Per item and order total
- **Coupon code input** – In Order Summary section
- **Delivery address** – Collapsible section
- **Proceed to Checkout** – Button

---

## 3. Coupon Code Test

### Coupon UI Location

- **Visible when:** User is logged in and has items in cart
- **Location:** Order Summary section, above subtotal
- **Elements:** Input with "Enter coupon code" placeholder, Apply button

### Valid Coupon: WELCOME10

- **Type:** 10% off
- **Min order:** ₹500
- **Max discount:** ₹200
- **Valid until:** Dec 31, 2026

### Invalid Coupon Handling

- Error message shown in red (`text-error` class)
- Examples: "Invalid coupon", "Coupon expired", "Minimum order not met"

### Automated Coupon Test

A full coupon flow test (valid + invalid) is implemented but **skipped by default** because it requires credentials:

```bash
E2E_TEST_EMAIL=your@email.com E2E_TEST_PASSWORD=yourpass \
  TEST_URL=https://jaee.vercel.app \
  npx playwright test tests/cart-coupon-e2e.spec.ts -g "coupon flow"
```

---

## 4. Login Page Test

### Form Elements

| Element | Status |
|---------|--------|
| "Welcome Back" heading | ✅ |
| Email tab | ✅ |
| Email input | ✅ |
| Password input | ✅ |
| Sign In button | ✅ |
| Forgot password link | ✅ Links to /forgot-password |
| Register link | ✅ "Sign up" links to /register |
| Mobile OTP tab | ✅ Switches to mobile number + OTP flow |

### Auth Modes

1. **Email/Password** – Email, password, forgot password
2. **Mobile OTP** – Phone number → OTP sent → Verify

---

## 5. Bugs & Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| None | - | No critical bugs in tested flows |

---

## 6. Missing Features / UX Notes

| Item | Notes |
|------|-------|
| Guest cart visibility | By design – guests must sign in to see cart. Cart is merged on login. |
| Coupon for guests | Coupons only apply for logged-in users (server-side cart). |

---

## 7. Test Execution

```bash
cd frontend
TEST_URL=https://jaee.vercel.app npx playwright test tests/cart-coupon-e2e.spec.ts
```

**Results:** 7 passed, 1 skipped (coupon flow with credentials)

---

## 8. Recommendations

1. **Coupon testing:** Add a test account or use `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` to run the full coupon flow.
2. **Guest cart:** Consider a "View cart" link that shows a simplified guest cart (e.g. item count) before sign-in.
3. **Coupon discoverability:** Add a hint or banner about available coupons (e.g. WELCOME10) on cart/checkout.
