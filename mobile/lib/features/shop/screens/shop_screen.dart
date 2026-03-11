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
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() => setState(() {}));
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
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch(String query) {
    ref.read(filtersProvider.notifier).state =
        ref.read(filtersProvider).copyWith(search: query, page: 0);
  }

  @override
  Widget build(BuildContext context) {
    // When categorySlug is set, update filter once categories load
    ref.listen(categoriesProvider, (previous, next) {
      if (widget.categorySlug != null && next.hasValue) {
        final cat = next.value!.where((c) => c.slug == widget.categorySlug).firstOrNull;
        if (cat != null) {
          final current = ref.read(filtersProvider);
          if (current.categoryId != cat.id) {
            ref.read(filtersProvider.notifier).state = current.copyWith(categoryId: cat.id, page: 0);
          }
        }
      }
    });

    if (widget.saleOnly) return _buildSaleScreen();
    return _buildShopScreen();
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
          // Search bar
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

          // Category chips
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
                          filters.copyWith(clearCategory: true, page: 0),
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
                          filters.copyWith(categoryId: cat.id, page: 0),
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

          // Sort bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Row(
              children: [
                productsAsync.when(
                  data: (page) => Text('${page.totalElements} products', style: AppTypography.caption),
                  loading: () => const SizedBox(),
                  error: (_, __) => const SizedBox(),
                ),
                const Spacer(),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    final parts = value.split(':');
                    ref.read(filtersProvider.notifier).state =
                        filters.copyWith(sortBy: parts[0], sortDir: parts[1], page: 0);
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

          // Product grid
          Expanded(
            child: productsAsync.when(
              data: (page) {
                if (page.content.isEmpty) {
                  return const EmptyState(
                    icon: Icons.shopping_bag_outlined,
                    title: 'No Products Found',
                    subtitle: 'Try adjusting your filters or search term.',
                  );
                }
                return Column(
                  children: [
                    Expanded(
                      child: GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 0.62,
                        ),
                        itemCount: page.content.length,
                        itemBuilder: (context, index) {
                          final product = page.content[index];
                          return ProductCard(
                            product: product,
                            onTap: () => context.push('/product/${product.slug}'),
                          );
                        },
                      ),
                    ),
                    if (page.totalPages > 1)
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            IconButton(
                              onPressed: page.first ? null : () {
                                ref.read(filtersProvider.notifier).state =
                                    filters.copyWith(page: filters.page - 1);
                              },
                              icon: const Icon(Icons.chevron_left),
                            ),
                            Text('${page.page + 1} / ${page.totalPages}', style: AppTypography.labelMedium),
                            IconButton(
                              onPressed: page.last ? null : () {
                                ref.read(filtersProvider.notifier).state =
                                    filters.copyWith(page: filters.page + 1);
                              },
                              icon: const Icon(Icons.chevron_right),
                            ),
                          ],
                        ),
                      ),
                  ],
                );
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
    final saleAsync = ref.watch(saleProductsProvider(_currentPage));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('On Sale', style: AppTypography.h4),
        centerTitle: true,
      ),
      body: saleAsync.when(
        data: (page) {
          if (page.content.isEmpty) {
            return const EmptyState(
              icon: Icons.local_offer_outlined,
              title: 'No Sale Products',
              subtitle: 'Check back later for deals!',
            );
          }
          return Column(
            children: [
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.62,
                  ),
                  itemCount: page.content.length,
                  itemBuilder: (context, index) {
                    final product = page.content[index];
                    return ProductCard(
                      product: product,
                      onTap: () => context.push('/product/${product.slug}'),
                    );
                  },
                ),
              ),
              if (page.totalPages > 1)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        onPressed: page.first ? null : () => setState(() => _currentPage--),
                        icon: const Icon(Icons.chevron_left),
                      ),
                      Text('${page.page + 1} / ${page.totalPages}', style: AppTypography.labelMedium),
                      IconButton(
                        onPressed: page.last ? null : () => setState(() => _currentPage++),
                        icon: const Icon(Icons.chevron_right),
                      ),
                    ],
                  ),
                ),
            ],
          );
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
          onRetry: () => ref.invalidate(saleProductsProvider(_currentPage)),
        ),
      ),
    );
  }
}
