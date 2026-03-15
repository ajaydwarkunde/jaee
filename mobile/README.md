# Jaee Mobile App

Flutter mobile application for the Jaee e-commerce store. Targets both Android and iOS from a single Dart codebase.

## Prerequisites

- Flutter SDK >= 3.2.0
- Dart SDK >= 3.2.0
- Android Studio / Xcode (for platform-specific builds)
- Google Cloud project with OAuth client ID (for Google sign-in)
- Razorpay account (for payments)

## Getting Started

### 1. Install Flutter dependencies

```bash
cd mobile
flutter pub get
```

### 2. Google Sign-In setup (optional)

Google sign-in uses the `google_sign_in` package directly (no Firebase required).

- **Android:** Add your OAuth client ID in `android/app/src/main/res/values/strings.xml`
- **iOS:** Add your reversed client ID to `ios/Runner/Info.plist`
- See [google_sign_in docs](https://pub.dev/packages/google_sign_in) for full setup

### 3. Configure environment

Pass configuration at build time using `--dart-define`:

```bash
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:8080 \
  --dart-define=RAZORPAY_KEY_ID=rzp_test_xxx
```

| Variable | Description | Default |
|---|---|---|
| `API_BASE_URL` | Backend API URL | `http://10.0.2.2:8080` (Android emulator localhost) |
| `RAZORPAY_KEY_ID` | Razorpay key | (empty) |

### 4. Run the app

```bash
# Android
flutter run

# iOS
flutter run -d ios

# Specific device
flutter devices
flutter run -d <device_id>
```

## Project Structure

```
lib/
├── main.dart                    # Entry point
├── app.dart                     # MaterialApp with theme and router
├── core/
│   ├── config/                  # App config, API endpoints
│   ├── network/                 # Dio client, auth interceptor, token storage
│   ├── providers/               # Auth, cart, API client providers
│   ├── router/                  # GoRouter with route guards
│   ├── theme/                   # Colors, typography, ThemeData
│   └── utils/                   # Password encoder, formatters
├── features/
│   ├── auth/                    # Login, register, password reset
│   ├── home/                    # Home screen with featured products
│   ├── shop/                    # Product listing, filters, search
│   ├── product/                 # Product detail, reviews
│   ├── cart/                    # Cart (guest + authenticated)
│   ├── checkout/                # Address selection, Razorpay payment
│   ├── orders/                  # Order list and detail
│   ├── wishlist/                # Wishlist
│   ├── account/                 # Profile, addresses, settings
│   ├── custom_candle/           # Custom candle builder
│   ├── custom_hamper/           # Gift hamper builder
│   └── admin/                   # Admin dashboard, orders, products
├── models/                      # Dart data classes
└── shared/widgets/              # Reusable UI components
```

## Architecture

- **State management:** Riverpod (StateNotifier + FutureProvider)
- **HTTP client:** Dio with auth interceptor and automatic token refresh
- **Routing:** GoRouter with redirect-based auth guards
- **Token storage:** flutter_secure_storage (encrypted)
- **Design system:** Matches the web app -- cream/rose/charcoal palette, Cormorant Garamond + DM Sans fonts

## Key Features

- Email/password and email OTP login
- Google sign-in (standalone, no Firebase needed)
- Product browsing with filters, search, and sort
- Guest cart (localStorage) and authenticated cart (server)
- Cart merge on login
- Razorpay checkout integration
- Wishlist
- Order history and tracking
- Address management
- Custom candle and gift hamper builders
- Admin panel (orders, products, categories, coupons)
- Pull-to-refresh, shimmer loading, error states

## Building for Release

### Android

```bash
flutter build apk --release
# or
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```

Then archive and submit via Xcode.

## Backend

This app consumes the existing Spring Boot REST API at `/backend`. No backend changes are required -- the same API serves both the web and mobile clients.
