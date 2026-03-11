import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/shimmer_loading.dart';
import '../../../shared/widgets/error_view.dart';
import '../providers/home_providers.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        color: AppColors.rose,
        onRefresh: () async {
          ref.invalidate(featuredProductsProvider);
          ref.invalidate(categoriesProvider);
          ref.invalidate(onSaleProductsProvider);
        },
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              floating: true,
              backgroundColor: AppColors.softWhite,
              title: Text('Jaee', style: AppTypography.h3.copyWith(color: AppColors.rose)),
              centerTitle: true,
              actions: [
                IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () => context.push('/shop'),
                ),
              ],
            ),

            // Hero banner
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.blush, AppColors.cream],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Handcrafted', style: AppTypography.h2.copyWith(color: AppColors.roseDark)),
                    Text('With Love', style: AppTypography.h2.copyWith(color: AppColors.roseDark)),
                    const SizedBox(height: 12),
                    Text(
                      'Discover our collection of artisan candles & fragrances',
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.warmGray),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () => context.go('/shop'),
                      child: const Text('Shop Now'),
                    ),
                  ],
                ),
              ),
            ),

            // Categories
            SliverToBoxAdapter(
              child: _SectionHeader(
                title: 'Shop by Category',
                onViewAll: () => context.go('/shop'),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 120,
                child: ref.watch(categoriesProvider).when(
                  data: (categories) => ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final cat = categories[index];
                      return GestureDetector(
                        onTap: () => context.push('/shop/${cat.slug}'),
                        child: Container(
                          width: 100,
                          margin: const EdgeInsets.only(right: 12),
                          child: Column(
                            children: [
                              Container(
                                width: 72,
                                height: 72,
                                decoration: BoxDecoration(
                                  color: AppColors.blush,
                                  shape: BoxShape.circle,
                                  image: cat.imageUrl != null
                                      ? DecorationImage(
                                          image: NetworkImage(cat.imageUrl!),
                                          fit: BoxFit.cover,
                                        )
                                      : null,
                                ),
                                child: cat.imageUrl == null
                                    ? const Icon(Icons.category, color: AppColors.rose)
                                    : null,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                cat.name,
                                style: AppTypography.labelSmall.copyWith(color: AppColors.charcoal),
                                textAlign: TextAlign.center,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  loading: () => ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: 4,
                    itemBuilder: (_, __) => Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: Column(
                        children: [
                          const ShimmerLoading(width: 72, height: 72, borderRadius: 36),
                          const SizedBox(height: 8),
                          ShimmerLoading(width: 60, height: 12),
                        ],
                      ),
                    ),
                  ),
                  error: (e, _) => Center(child: Text('Failed to load categories')),
                ),
              ),
            ),

            // Featured Products
            SliverToBoxAdapter(
              child: _SectionHeader(
                title: 'Featured Products',
                onViewAll: () => context.go('/shop'),
              ),
            ),
            ref.watch(featuredProductsProvider).when(
              data: (products) => SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.62,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => ProductCard(
                      product: products[index],
                      onTap: () => context.push('/product/${products[index].slug}'),
                    ),
                    childCount: products.length,
                  ),
                ),
              ),
              loading: () => SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.62,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (_, __) => const ProductCardShimmer(),
                    childCount: 4,
                  ),
                ),
              ),
              error: (e, _) => SliverToBoxAdapter(
                child: ErrorView(
                  message: 'Failed to load products',
                  onRetry: () => ref.invalidate(featuredProductsProvider),
                ),
              ),
            ),

            // Custom creation CTAs
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: _CtaCard(
                        title: 'Custom\nCandle',
                        icon: Icons.local_fire_department_outlined,
                        onTap: () => context.push('/custom-candle'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _CtaCard(
                        title: 'Gift\nHamper',
                        icon: Icons.card_giftcard_outlined,
                        onTap: () => context.push('/custom-hamper'),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback? onViewAll;

  const _SectionHeader({required this.title, this.onViewAll});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: AppTypography.h4),
          if (onViewAll != null)
            GestureDetector(
              onTap: onViewAll,
              child: Text('View All', style: AppTypography.labelMedium.copyWith(color: AppColors.rose)),
            ),
        ],
      ),
    );
  }
}

class _CtaCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _CtaCard({required this.title, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.blush,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 32, color: AppColors.rose),
            const SizedBox(height: 12),
            Text(title, style: AppTypography.h5.copyWith(color: AppColors.roseDark)),
            const SizedBox(height: 8),
            Text('Create yours', style: AppTypography.caption.copyWith(color: AppColors.rose)),
          ],
        ),
      ),
    );
  }
}
