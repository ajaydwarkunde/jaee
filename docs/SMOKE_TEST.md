# Smoke Test Checklist

Manual verification checklist to run before releases. Test against staging first, then production.

## Public Flows (Web)

### Homepage
- [ ] Page loads without errors
- [ ] Logo and branding display correctly
- [ ] Navigation links work (Shop, About, etc.)
- [ ] Featured products section renders with images and prices
- [ ] "Shop Now" CTA navigates to shop page
- [ ] Announcement bar displays when enabled

### Shop Page
- [ ] Products grid loads with images, names, and prices
- [ ] Category filter narrows product list
- [ ] Price sorting works (low-to-high, high-to-low)
- [ ] Search returns relevant results
- [ ] Pagination or infinite scroll works
- [ ] "On Sale" badge shows on discounted products

### Product Detail
- [ ] Product images display and are zoomable/swipeable
- [ ] Variant selection (size, color) works
- [ ] Price updates when variant changes
- [ ] "Add to Cart" button works
- [ ] Stock status shows correctly (in stock / out of stock)
- [ ] Related products section displays
- [ ] Reviews section loads (summary + list)

### Cart
- [ ] Items display with image, name, price, quantity
- [ ] Quantity increment/decrement works
- [ ] Remove item works
- [ ] Cart total updates correctly
- [ ] Coupon code input works (valid code applies discount)
- [ ] Invalid coupon shows error message
- [ ] "Proceed to Checkout" navigates correctly

### Authentication
- [ ] Register with email/password creates account
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Forgot password sends reset email
- [ ] Password reset with valid token works
- [ ] Logout clears session and redirects
- [ ] Google social login works (if enabled)
- [ ] Phone OTP login works (if enabled)

### Checkout
- [ ] Requires login before proceeding
- [ ] Address selection/creation works
- [ ] Order summary shows correct items and totals
- [ ] Coupon discount reflects in total
- [ ] Razorpay payment modal opens
- [ ] Successful payment redirects to order success page
- [ ] Order success page shows order details

### Wishlist
- [ ] Add product to wishlist (heart icon)
- [ ] Wishlist page shows saved products
- [ ] Remove from wishlist works
- [ ] "Add to Cart" from wishlist works

### Custom Builders
- [ ] Custom candle builder loads options
- [ ] Selections update preview and price
- [ ] Submit request works
- [ ] Custom hamper builder loads options
- [ ] Submit request works

## Post-Purchase Flows

- [ ] Order appears in "My Orders" list
- [ ] Order detail page shows items, status, tracking info
- [ ] Order status updates reflect correctly (PENDING, PAID, SHIPPED, etc.)
- [ ] Order success page displays correct order summary
- [ ] Order failure page displays with retry option

## Account Management

- [ ] Profile page loads with user info
- [ ] Edit profile (name, email) works
- [ ] Change password works
- [ ] Address book: add, edit, delete, set default
- [ ] Order history lists all orders with status

## Admin Flows

### Dashboard
- [ ] Admin dashboard shows stats (total orders, revenue, etc.)
- [ ] Store sales analytics display correctly

### Products
- [ ] Product list shows all products
- [ ] Create new product with images, variants, categories
- [ ] Edit existing product
- [ ] Delete product
- [ ] Variant management (add, edit, delete variants)

### Categories
- [ ] Category list displays
- [ ] Create, edit, delete category

### Orders
- [ ] Order list with status filter
- [ ] View order details
- [ ] Update order status (PAID, SHIPPED, FULFILLED, CANCELLED)
- [ ] Add tracking information

### Coupons
- [ ] Coupon list displays
- [ ] Create coupon (percentage/fixed, min order, usage limit, dates)
- [ ] Edit coupon
- [ ] Delete coupon

### Custom Requests
- [ ] Custom candle requests list
- [ ] Gift hamper requests list
- [ ] Builder options management

## Mobile App

### Startup
- [ ] App launches without crash
- [ ] Splash screen displays
- [ ] Home screen loads products

### Authentication
- [ ] Login with email/password
- [ ] Register new account
- [ ] Google sign-in
- [ ] Logout

### Shopping
- [ ] Browse products
- [ ] Search products
- [ ] Filter by category
- [ ] View product detail
- [ ] Add to cart

### Checkout
- [ ] Cart displays items correctly
- [ ] Razorpay payment works
- [ ] Order confirmation displays

### Account
- [ ] View profile
- [ ] View order history
- [ ] Manage addresses

### Notifications
- [ ] Push notification permission prompt
- [ ] Notifications received for order updates

## Cross-Cutting Concerns

### Responsive Design
- [ ] Desktop (1920px): full layout
- [ ] Tablet (768px): adapted layout
- [ ] Mobile (375px): mobile layout, hamburger menu

### Dark Mode
- [ ] Toggle between light and dark mode
- [ ] All pages readable in both modes
- [ ] Images and icons adapt to mode

### Error Handling
- [ ] 404 page displays for unknown routes
- [ ] Network error shows user-friendly message
- [ ] API timeout shows retry option
- [ ] Form validation errors display inline

### Performance
- [ ] Homepage loads in under 3 seconds
- [ ] Shop page loads in under 3 seconds
- [ ] Images lazy load on scroll
- [ ] No visible layout shift (CLS)

### Security
- [ ] Protected routes redirect to login
- [ ] Admin routes inaccessible to regular users
- [ ] JWT token refreshes automatically
- [ ] Expired sessions redirect to login
