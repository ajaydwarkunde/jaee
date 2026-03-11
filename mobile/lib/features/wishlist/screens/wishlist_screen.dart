import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/empty_state.dart';
import '../providers/wishlist_providers.dart';

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: Text('Wishlist', style: AppTypography.h4), centerTitle: true),
        body: EmptyState(
          icon: Icons.favorite_outline,
          title: 'Sign in to view your wishlist',
          actionLabel: 'Sign In',
          onAction: () => context.push('/login'),
        ),
      );
    }

    final wishlistAsync = ref.watch(wishlistProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Wishlist', style: AppTypography.h4), centerTitle: true),
      body: wishlistAsync.when(
        data: (products) {
          if (products.isEmpty) {
            return EmptyState(
              icon: Icons.favorite_outline,
              title: 'Your wishlist is empty',
              subtitle: 'Save items you love for later',
              actionLabel: 'Browse Products',
              onAction: () => context.go('/shop'),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.62,
            ),
            itemCount: products.length,
            itemBuilder: (_, i) => ProductCard(
              product: products[i],
              isFavorite: true,
              onTap: () => context.push('/product/${products[i].slug}'),
              onFavoriteTap: () async {
                try {
                  await ref.read(apiClientProvider).dio.delete(
                    ApiEndpoints.wishlistItem(products[i].id),
                  );
                  ref.invalidate(wishlistProvider);
                  ref.invalidate(wishlistIdsProvider);
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(ApiException.getErrorMessage(e))),
                    );
                  }
                }
              },
            ),
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: ApiException.getErrorMessage(e),
          onRetry: () => ref.invalidate(wishlistProvider),
        ),
      ),
    );
  }
}
