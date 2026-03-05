# Jaee E2E Test Report

**Test Date:** February 23, 2026  
**Test Target:** Jaee e-commerce website

---

## Executive Summary

| Test Target | Status | Notes |
|-------------|--------|-------|
| **https://jaee-frontend.onrender.com** | ❌ **Unreachable** | Returns 404 Not Found |
| **https://jaee.vercel.app** | ✅ **All Pass** | Documented production deployment |

---

## 1. Critical Issue: Render URL Unreachable

**URL:** https://jaee-frontend.onrender.com

**Finding:** The URL returns **404 Not Found**. The site cannot be tested at this address.

**Possible causes:**
- Frontend may not be deployed to Render (docs indicate Vercel is the frontend host)
- Service name or URL may differ (e.g. custom subdomain)
- Deployment may have been removed or not yet created

**Recommendation:** Verify the Render deployment URL. Per `docs/DEPLOYMENT.md`, the architecture uses:
- **Frontend:** Vercel (https://jaee.vercel.app)
- **Backend:** Render (https://jaee-api.onrender.com)

---

## 2. Vercel Deployment Test Results (https://jaee.vercel.app)

All 5 E2E tests **passed** on the Vercel deployment.

### 2.1 Homepage Load Test ✅

| Check | Result |
|-------|--------|
| Header with logo and navigation | ✅ Visible |
| Products displayed | ✅ Featured products in carousel |
| Footer visible | ✅ Visible |
| **Page load time** | **~1.9–2.2 seconds** (acceptable) |

**Notes:** Products are in a horizontal carousel; first product may require scroll into view on smaller viewports.

### 2.2 Navigation Test ✅

| Check | Result |
|-------|--------|
| Shop link | ✅ Works |
| Products page loads | ✅ Products displayed |
| Category navigation (Candles/Gifts) | ✅ Works |
| Cart icon in header | ✅ Visible, navigates to /cart |
| **Shop navigation time** | **~80–110ms** (fast) |

### 2.3 Product Browsing ✅

| Check | Result |
|-------|--------|
| Product card click | ✅ Opens product detail page |
| Product image | ✅ Visible |
| Price | ✅ Displayed (₹ format) |
| Add to Cart button | ✅ Visible |
| Description | Present in product layout |

---

## 3. Test Execution Summary

```
Running 5 tests using 1 worker
[TIMING] Homepage load: 1911ms
[TIMING] Shop navigation: 81ms
  5 passed (16.0s)
```

### Tests Covered

1. **Homepage Load Test** – Header, products, footer
2. **Shop Navigation** – Navigate to /shop, verify products
3. **Category Navigation** – Candles/Gifts links
4. **Cart Icon** – Header cart link to /cart
5. **Product Details** – Product page with image, price, Add to Cart

---

## 4. Run E2E Tests

```bash
# Test Vercel (production)
cd frontend && npm run test:prod

# Test Render (if URL becomes available)
cd frontend && npm run test:render

# Run the Render E2E spec against any URL
TEST_URL=https://your-url.com npx playwright test tests/render-e2e.spec.ts
```

---

## 5. Recommendations

1. **Render URL:** Confirm whether a frontend is deployed at `jaee-frontend.onrender.com` and fix or document the correct URL.
2. **Performance:** Homepage load ~2s is acceptable; consider lazy-loading for below-fold content if needed.
3. **Test coverage:** The `tests/render-e2e.spec.ts` spec is suitable for both Render and Vercel once the Render URL is correct.
