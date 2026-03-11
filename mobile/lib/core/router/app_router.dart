import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/reset_password_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/shop/screens/shop_screen.dart';
import '../../features/product/screens/product_detail_screen.dart';
import '../../features/cart/screens/cart_screen.dart';
import '../../features/checkout/screens/checkout_screen.dart';
import '../../features/orders/screens/orders_screen.dart';
import '../../features/orders/screens/order_detail_screen.dart';
import '../../features/wishlist/screens/wishlist_screen.dart';
import '../../features/account/screens/account_screen.dart';
import '../../features/account/screens/profile_screen.dart';
import '../../features/account/screens/addresses_screen.dart';
import '../../features/custom_candle/screens/custom_candle_screen.dart';
import '../../features/custom_hamper/screens/custom_hamper_screen.dart';
import '../../features/admin/screens/admin_dashboard_screen.dart';
import '../../features/admin/screens/admin_products_screen.dart';
import '../../features/admin/screens/admin_categories_screen.dart';
import '../../features/admin/screens/admin_coupons_screen.dart';
import '../../features/admin/screens/admin_orders_screen.dart';
import '../../shared/widgets/shell_scaffold.dart';
import '../../shared/widgets/not_found_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      if (authState.isLoading) return null;

      final isAuthenticated = authState.isAuthenticated;
      final isAdmin = authState.isAdmin;
      final location = state.matchedLocation;

      final authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
      final isOnAuthRoute = authRoutes.any((r) => location.startsWith(r));

      if (isOnAuthRoute && isAuthenticated) return '/';

      final protectedRoutes = ['/account', '/profile', '/addresses', '/orders', '/checkout'];
      final isOnProtectedRoute = protectedRoutes.any((r) => location.startsWith(r));
      if (isOnProtectedRoute && !isAuthenticated) return '/login';

      final isOnAdminRoute = location.startsWith('/admin');
      if (isOnAdminRoute && !isAdmin) return '/';

      return null;
    },
    errorBuilder: (context, state) => const NotFoundScreen(),
    routes: [
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => ShellScaffold(child: child),
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/shop',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ShopScreen(),
            ),
          ),
          GoRoute(
            path: '/shop/:categorySlug',
            builder: (context, state) => ShopScreen(
              categorySlug: state.pathParameters['categorySlug'],
            ),
          ),
          GoRoute(
            path: '/product/:slug',
            builder: (context, state) => ProductDetailScreen(
              slug: state.pathParameters['slug']!,
            ),
          ),
          GoRoute(
            path: '/sale',
            builder: (context, state) => const ShopScreen(saleOnly: true),
          ),
          GoRoute(
            path: '/wishlist',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: WishlistScreen(),
            ),
          ),
          GoRoute(
            path: '/cart',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: CartScreen(),
            ),
          ),
          GoRoute(
            path: '/account',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: AccountScreen(),
            ),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/addresses',
            builder: (context, state) => const AddressesScreen(),
          ),
          GoRoute(
            path: '/orders',
            builder: (context, state) => const OrdersScreen(),
          ),
          GoRoute(
            path: '/orders/:orderId',
            builder: (context, state) => OrderDetailScreen(
              orderId: int.parse(state.pathParameters['orderId']!),
            ),
          ),
          GoRoute(
            path: '/custom-candle',
            builder: (context, state) => const CustomCandleScreen(),
          ),
          GoRoute(
            path: '/custom-hamper',
            builder: (context, state) => const CustomHamperScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/checkout',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/login',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/reset-password',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => ResetPasswordScreen(
          token: state.uri.queryParameters['token'],
        ),
      ),
      GoRoute(
        path: '/admin',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/admin/orders',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminOrdersScreen(),
      ),
      GoRoute(
        path: '/admin/products',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminProductsScreen(),
      ),
      GoRoute(
        path: '/admin/categories',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminCategoriesScreen(),
      ),
      GoRoute(
        path: '/admin/coupons',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminCouponsScreen(),
      ),
    ],
  );
});
