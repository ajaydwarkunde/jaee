class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String phoneLogin = '/auth/phone';
  static const String socialLogin = '/auth/social';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String requestOtp = '/auth/otp/request';
  static const String verifyOtp = '/auth/otp/verify';
  static const String requestEmailOtp = '/auth/email-otp/request';
  static const String verifyEmailOtp = '/auth/email-otp/verify';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String sendVerificationEmail = '/auth/verify-email/send';
  static const String verifyEmail = '/auth/verify-email';
  static const String resendVerificationEmail = '/auth/verify-email/resend';

  // User / Profile
  static const String me = '/me';
  static const String updateProfile = '/me/profile';
  static const String changePassword = '/me/change-password';
  static const String requestMobileChangeOtp = '/me/mobile/request-otp';
  static const String verifyMobileChange = '/me/mobile/verify';
  static const String setup2FA = '/me/2fa/setup';
  static const String enable2FA = '/me/2fa/enable';
  static const String disable2FA = '/me/2fa/disable';

  // Products
  static const String products = '/products';
  static String productBySlug(String slug) => '/products/$slug';
  static const String featuredProducts = '/products/featured';
  static const String onSaleProducts = '/products/on-sale';
  static String relatedProducts(int productId) => '/products/$productId/related';

  // Categories
  static const String categories = '/categories';
  static String categoryBySlug(String slug) => '/categories/$slug';

  // Cart
  static const String cart = '/cart';
  static const String cartItems = '/cart/items';
  static String cartItem(int itemId) => '/cart/items/$itemId';
  static const String mergeCart = '/cart/merge';

  // Orders
  static const String orders = '/orders';
  static String orderById(int orderId) => '/orders/$orderId';
  static String orderByRazorpayId(String razorpayOrderId) => '/orders/razorpay/$razorpayOrderId';

  // Checkout
  static const String createOrder = '/checkout/create-order';
  static const String verifyPayment = '/checkout/verify-payment';

  // Addresses
  static const String addresses = '/addresses';
  static String address(int id) => '/addresses/$id';
  static String setDefaultAddress(int id) => '/addresses/$id/default';

  // Wishlist
  static const String wishlist = '/wishlist';
  static String wishlistItem(int productId) => '/wishlist/$productId';
  static String checkWishlist(int productId) => '/wishlist/check/$productId';
  static const String wishlistProductIds = '/wishlist/product-ids';
  static const String wishlistCount = '/wishlist/count';

  // Coupons
  static String validateCoupon(String code) => '/coupons/validate/$code';

  // Reviews
  static String productReviews(int productId) => '/products/$productId/reviews';
  static String allProductReviews(int productId) => '/products/$productId/reviews/all';
  static String reviewSummary(int productId) => '/products/$productId/reviews/summary';
  static String myReview(int productId) => '/products/$productId/reviews/mine';
  static String canReview(int productId) => '/products/$productId/reviews/can-review';
  static const String reviews = '/reviews';
  static String review(int reviewId) => '/reviews/$reviewId';
  static const String myReviews = '/reviews/mine';
  static String markHelpful(int reviewId) => '/reviews/$reviewId/helpful';

  // Custom Candle
  static const String customCandles = '/custom-candles';
  static const String myCustomCandles = '/custom-candles/my-requests';

  // Gift Hamper
  static const String giftHampers = '/gift-hampers';
  static const String myGiftHampers = '/gift-hampers/my-requests';

  // Builder Options
  static String builderOptionsActive(String builderType) => '/builder-options/$builderType/active';

  // Newsletter
  static const String newsletterSubscribe = '/newsletter/subscribe';
  static const String newsletterUnsubscribe = '/newsletter/unsubscribe';

  // Stock Notifications
  static const String stockNotificationSubscribe = '/stock-notifications/subscribe';
  static String stockNotificationCount(int productId) => '/stock-notifications/count/$productId';

  // Store Settings
  static const String storeSettings = '/store/settings';

  // Images
  static const String uploadImage = '/images/upload';
  static const String uploadMultipleImages = '/images/upload/multiple';

  // Admin endpoints
  static const String adminProducts = '/admin/products';
  static String adminProduct(int id) => '/admin/products/$id';
  static const String adminCategories = '/admin/categories';
  static String adminCategory(int id) => '/admin/categories/$id';
  static const String adminOrders = '/admin/orders';
  static const String adminOrderStats = '/admin/orders/stats';
  static String adminOrder(int orderId) => '/admin/orders/$orderId';
  static String adminOrderStatus(int orderId) => '/admin/orders/$orderId/status';
  static String adminOrderTracking(int orderId) => '/admin/orders/$orderId/tracking';
  static const String adminCoupons = '/admin/coupons';
  static String adminCoupon(int id) => '/admin/coupons/$id';
  static const String adminSettings = '/admin/settings';
  static String adminSetting(String key) => '/admin/settings/$key';
}
