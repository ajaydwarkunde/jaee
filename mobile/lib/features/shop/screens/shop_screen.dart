import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/product_card.dart';
import '../../../shared/widgets/shimmer_loading.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../home/providers/home_providers.dart';
import '../providers/shop_providers.dart';

class ShopScreen extends ConsumerStatefulWidget {
  final String? categorySlug;
  final bool saleOnly;

  const ShopScreen({super.key, this.categorySlug, this.saleOnly = false});

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() => setState(() {}));
    _scrollController.addListener(_onScroll);
    if (widget.categorySlug != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final categoriesAsync = ref.read(categoriesProvider);
        final categories = categoriesAsync.valueOrNull ?? [];
        final cat = categories.where((c) => c.slug == widget.categorySlug).firstOrNull;
        if (cat != null) {
          ref.read(filtersProvider.notifier).state =
              ref.read(filtersProvider).copyWith(categoryId: cat.id);
        }
      });
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels < pos.maxScrollExtent - 600) return;

    if (widget.saleOnly) {
      ref.read(saleProductsProvider.notifier).loadMore();
    } else {
      ref.read(productsProvider.notifier).loadMore();
    }
  }

  void _onSearch(String query) {
    ref.read(filtersProvider.notifier).state =
        ref.read(filtersProvider).copyWith(search: query, clearSearch: query.isEmpty);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(categoriesProvider, (previous, next) {
      if (widget.categorySlug != null && next.hasValue) {
        final cat = next.value!.where((c) => c.slug == widget.categorySlug).firstOrNull;
        if (cat != null) {
          final current = ref.read(filtersProvider);
          if (current.categoryId != cat.id) {
            ref.read(filtersProvider.notifier).state = current.copyWith(categoryId: cat.id);
          }
        }
      }
    });

    if (widget.saleOnly) return _buildSaleScreen();
    return _buildShopScreen();
  }

  Widget _buildProductGrid({
    required ProductFeed feed,
  }) {
    if (feed.products.isEmpty) {
      return const EmptyState(
        icon: Icons.shopping_bag_outlined,
        title: 'No Products Found',
        subtitle: 'Try adjusting your filters or search term.',
      );
    }

    final showFooter = feed.loadingMore;
    final itemCount = feed.products.length + (showFooter ? 1 : 0);

    return GridView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.62,
      ),
      itemCount: itemCount,
      itemBuilder: (context, index) {
        if (index >= feed.products.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          );
        }
        final product = feed.products[index];
        return ProductCard(
          product: product,
          onTap: () => context.push('/product/${product.slug}'),
        );
      },
    );
  }

  Widget _buildShopScreen() {
    final productsAsync = ref.watch(productsProvider);
    final filters = ref.watch(filtersProvider);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(widget.categorySlug != null ? 'Category' : 'Shop', style: AppTypography.h4),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              onSubmitted: _onSearch,
              decoration: InputDecoration(
                hintText: 'Search products...',
                prefixIcon: const Icon(Icons.search, color: AppColors.warmGray),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 20),
                        onPressed: () {
                          _searchController.clear();
                          _onSearch('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppColors.softWhite,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          categoriesAsync.when(
            data: (categories) => SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: const Text('All'),
                      selected: filters.categoryId == null,
                      onSelected: (_) => ref.read(filtersProvider.notifier).state =
                          filters.copyWith(clearCategory: true),
                      selectedColor: AppColors.rose,
                      labelStyle: TextStyle(
                        color: filters.categoryId == null ? Colors.white : AppColors.charcoal,
                      ),
                      checkmarkColor: Colors.white,
                    ),
                  ),
                  ...categories.map((cat) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(cat.name),
                          selected: filters.categoryId == cat.id,
                          onSelected: (_) => ref.read(filtersProvider.notifier).state =
                              filters.copyWith(categoryId: cat.id),
                          selectedColor: AppColors.rose,
                          labelStyle: TextStyle(
                            color: filters.categoryId == cat.id ? Colors.white : AppColors.charcoal,
                          ),
                          checkmarkColor: Colors.white,
                        ),
                      )),
                ],
              ),
            ),
            loading: () => const SizedBox(height: 40),
            error: (_, __) => const SizedBox(height: 40),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Row(
              children: [
                productsAsync.when(
                  data: (feed) =>
                      Text('${feed.totalElements} products', style: AppTypography.caption),
                  loading: () => const SizedBox(),
                  error: (_, __) => const SizedBox(),
                ),
                const Spacer(),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    final parts = value.split(':');
                    ref.read(filtersProvider.notifier).state =
                        filters.copyWith(sortBy: parts[0], sortDir: parts[1]);
                  },
                  itemBuilder: (_) => const [
                    PopupMenuItem(value: 'newest:desc', child: Text('Newest')),
                    PopupMenuItem(value: 'price:asc', child: Text('Price: Low to High')),
                    PopupMenuItem(value: 'price:desc', child: Text('Price: High to Low')),
                    PopupMenuItem(value: 'name:asc', child: Text('Name: A-Z')),
                  ],
                  child: Row(
                    children: [
                      Text('Sort', style: AppTypography.labelSmall.copyWith(color: AppColors.rose)),
                      const Icon(Icons.sort, size: 18, color: AppColors.rose),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: productsAsync.when(
              data: (feed) => _buildProductGrid(feed: feed),
              loading: () => GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.62,
                ),
                itemCount: 6,
                itemBuilder: (_, __) => const ProductCardShimmer(),
              ),
              error: (e, _) => ErrorView(
                message: 'Failed to load products',
                onRetry: () => ref.invalidate(productsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSaleScreen() {
    final saleAsync = ref.watch(saleProductsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('On Sale', style: AppTypography.h4),
        centerTitle: true,
      ),
      body: saleAsync.when(
        data: (feed) {
          if (feed.products.isEmpty) {
            return const EmptyState(
              icon: Icons.local_offer_outlined,
              title: 'No Sale Products',
              subtitle: 'Check back later for deals!',
            );
          }
          return _buildProductGrid(feed: feed);
        },
        loading: () => GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.62,
          ),
          itemCount: 6,
          itemBuilder: (_, __) => const ProductCardShimmer(),
        ),
        error: (e, _) => ErrorView(
          message: 'Failed to load sale products',
          onRetry: () => ref.invalidate(saleProductsProvider),
        ),
      ),
    );
  }
}
