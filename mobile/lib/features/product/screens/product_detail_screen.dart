import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../models/product.dart';
import '../providers/product_providers.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String slug;
  const ProductDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  int _qty = 1;
  int _currentImage = 0;
  bool _addingToCart = false;

  Future<void> _addToCart(int productId) async {
    final auth = ref.read(authProvider);
    setState(() => _addingToCart = true);

    try {
      if (auth.isAuthenticated) {
        await ref.read(apiClientProvider).dio.post(
          ApiEndpoints.cartItems,
          data: {'productId': productId, 'qty': _qty},
        );
      } else {
        ref.read(guestCartProvider.notifier).addToCart(productId, _qty);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Added to cart'), duration: Duration(seconds: 2)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.getErrorMessage(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _addingToCart = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productBySlugProvider(widget.slug));

    return productAsync.when(
      data: (product) => _buildContent(product),
      loading: () => const Scaffold(body: LoadingIndicator()),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: ErrorView(
          message: ApiException.getErrorMessage(e),
          onRetry: () => ref.invalidate(productBySlugProvider(widget.slug)),
        ),
      ),
    );
  }

  Widget _buildContent(Product product) {
    final relatedAsync = ref.watch(relatedProductsProvider(product.id));
    final reviewSummaryAsync = ref.watch(reviewSummaryProvider(product.id));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // Image carousel
          SliverAppBar(
            expandedHeight: MediaQuery.of(context).size.width,
            pinned: true,
            backgroundColor: AppColors.cream,
            flexibleSpace: FlexibleSpaceBar(
              background: product.images.isNotEmpty
                  ? PageView.builder(
                      itemCount: product.images.length,
                      onPageChanged: (i) => setState(() => _currentImage = i),
                      itemBuilder: (_, i) => CachedNetworkImage(
                        imageUrl: product.images[i],
                        fit: BoxFit.cover,
                      ),
                    )
                  : Container(
                      color: AppColors.cream,
                      child: const Icon(Icons.image_outlined, size: 64, color: AppColors.warmGray),
                    ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image indicators
                  if (product.images.length > 1)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          product.images.length,
                          (i) => Container(
                            width: i == _currentImage ? 24 : 8,
                            height: 8,
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            decoration: BoxDecoration(
                              color: i == _currentImage ? AppColors.rose : AppColors.divider,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                    ),

                  // Category
                  if (product.categoryName != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(product.categoryName!, style: AppTypography.labelSmall.copyWith(color: AppColors.rose)),
                    ),

                  // Name
                  Text(product.name, style: AppTypography.h3),
                  const SizedBox(height: 12),

                  // Price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(Formatters.formatPrice(product.price), style: AppTypography.price.copyWith(fontSize: 24)),
                      if (product.isOnSale) ...[
                        const SizedBox(width: 8),
                        Text(Formatters.formatPrice(product.compareAtPrice!), style: AppTypography.priceStrikethrough.copyWith(fontSize: 16)),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.rose, borderRadius: BorderRadius.circular(4)),
                          child: Text(
                            '${product.discountPercent ?? Formatters.calculateDiscountPercent(product.price, product.compareAtPrice!)}% OFF',
                            style: AppTypography.caption.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Stock status
                  Row(
                    children: [
                      Icon(
                        product.inStock ? Icons.check_circle : Icons.cancel,
                        size: 16,
                        color: product.inStock ? AppColors.success : AppColors.error,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        product.inStock ? 'In Stock' : 'Out of Stock',
                        style: AppTypography.labelSmall.copyWith(
                          color: product.inStock ? AppColors.success : AppColors.error,
                        ),
                      ),
                    ],
                  ),

                  // Rating
                  reviewSummaryAsync.when(
                    data: (summary) => summary.totalReviews > 0
                        ? Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: Row(
                              children: [
                                ...List.generate(5, (i) => Icon(
                                  i < summary.averageRating.round() ? Icons.star : Icons.star_border,
                                  size: 18,
                                  color: AppColors.warning,
                                )),
                                const SizedBox(width: 8),
                                Text(
                                  '${summary.averageRating.toStringAsFixed(1)} (${summary.totalReviews} reviews)',
                                  style: AppTypography.bodySmall.copyWith(color: AppColors.warmGray),
                                ),
                              ],
                            ),
                          )
                        : const SizedBox.shrink(),
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                  ),

                  const SizedBox(height: 20),

                  // Description
                  if (product.description != null && product.description!.isNotEmpty) ...[
                    Text('Description', style: AppTypography.h5),
                    const SizedBox(height: 8),
                    Text(product.description!, style: AppTypography.bodyMedium.copyWith(color: AppColors.warmGray)),
                    const SizedBox(height: 24),
                  ],

                  // Quantity selector + Add to cart
                  if (product.inStock) ...[
                    Row(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.divider),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                onPressed: _qty > 1 ? () => setState(() => _qty--) : null,
                                icon: const Icon(Icons.remove, size: 20),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: Text('$_qty', style: AppTypography.labelLarge),
                              ),
                              IconButton(
                                onPressed: _qty < product.stockQty ? () => setState(() => _qty++) : null,
                                icon: const Icon(Icons.add, size: 20),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: AppButton(
                            label: 'Add to Cart',
                            icon: Icons.shopping_cart_outlined,
                            onPressed: () => _addToCart(product.id),
                            isLoading: _addingToCart,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Related products
                  relatedAsync.when(
                    data: (related) => related.isNotEmpty
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('You May Also Like', style: AppTypography.h5),
                              const SizedBox(height: 12),
                              SizedBox(
                                height: 280,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  itemCount: related.length,
                                  itemBuilder: (_, i) => Padding(
                                    padding: const EdgeInsets.only(right: 12),
                                    child: SizedBox(
                                      width: 170,
                                      child: ProductCard(
                                        product: related[i],
                                        onTap: () => context.push('/product/${related[i].slug}'),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          )
                        : const SizedBox.shrink(),
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
