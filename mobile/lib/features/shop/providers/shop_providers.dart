import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_response.dart';
import '../../../models/product.dart';

class ProductFilters {
  final int? categoryId;
  final double? minPrice;
  final double? maxPrice;
  final String? search;
  final String? sortBy;
  final String? sortDir;
  final int pageSize;

  const ProductFilters({
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.search,
    this.sortBy,
    this.sortDir,
    this.pageSize = 24,
  });

  ProductFilters copyWith({
    int? categoryId,
    double? minPrice,
    double? maxPrice,
    String? search,
    String? sortBy,
    String? sortDir,
    int? pageSize,
    bool clearCategory = false,
    bool clearSearch = false,
  }) {
    return ProductFilters(
      categoryId: clearCategory ? null : (categoryId ?? this.categoryId),
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      search: clearSearch ? null : (search ?? this.search),
      sortBy: sortBy ?? this.sortBy,
      sortDir: sortDir ?? this.sortDir,
      pageSize: pageSize ?? this.pageSize,
    );
  }

  Map<String, dynamic> toQueryParams({required int page}) {
    return {
      if (categoryId != null) 'categoryId': categoryId,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
      if (search != null && search!.isNotEmpty) 'search': search,
      if (sortBy != null) 'sortBy': sortBy,
      if (sortDir != null) 'sortDir': sortDir,
      'page': page,
      // Backend uses pageSize (not size — size is the variant Size filter).
      'pageSize': pageSize,
    };
  }
}

class ProductFeed {
  final List<Product> products;
  final int page;
  final int totalElements;
  final int totalPages;
  final bool last;
  final bool loadingMore;

  const ProductFeed({
    required this.products,
    required this.page,
    required this.totalElements,
    required this.totalPages,
    required this.last,
    this.loadingMore = false,
  });

  ProductFeed copyWith({
    List<Product>? products,
    int? page,
    int? totalElements,
    int? totalPages,
    bool? last,
    bool? loadingMore,
  }) {
    return ProductFeed(
      products: products ?? this.products,
      page: page ?? this.page,
      totalElements: totalElements ?? this.totalElements,
      totalPages: totalPages ?? this.totalPages,
      last: last ?? this.last,
      loadingMore: loadingMore ?? this.loadingMore,
    );
  }
}

final filtersProvider = StateProvider<ProductFilters>((ref) => const ProductFilters());

final productsProvider = AsyncNotifierProvider<ProductsNotifier, ProductFeed>(ProductsNotifier.new);

class ProductsNotifier extends AsyncNotifier<ProductFeed> {
  @override
  Future<ProductFeed> build() async {
    final filters = ref.watch(filtersProvider);
    return _fetchPage(filters, page: 0, previous: const []);
  }

  Future<ProductFeed> _fetchPage(
    ProductFilters filters, {
    required int page,
    required List<Product> previous,
  }) async {
    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.dio.get(
      ApiEndpoints.products,
      queryParameters: filters.toQueryParams(page: page),
    );
    final pageData = PageResponse.fromJson(
      response.data['data'] as Map<String, dynamic>,
      (json) => Product.fromJson(json),
    );
    return ProductFeed(
      products: [...previous, ...pageData.content],
      page: pageData.page,
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      last: pageData.last,
    );
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || current.last || current.loadingMore) return;

    state = AsyncData(current.copyWith(loadingMore: true));
    try {
      final filters = ref.read(filtersProvider);
      final next = await _fetchPage(
        filters,
        page: current.page + 1,
        previous: current.products,
      );
      state = AsyncData(next);
    } catch (_) {
      state = AsyncData(current.copyWith(loadingMore: false));
    }
  }
}

final saleProductsProvider =
    AsyncNotifierProvider.autoDispose<SaleProductsNotifier, ProductFeed>(SaleProductsNotifier.new);

class SaleProductsNotifier extends AutoDisposeAsyncNotifier<ProductFeed> {
  @override
  Future<ProductFeed> build() async {
    return _fetchPage(page: 0, previous: const []);
  }

  Future<ProductFeed> _fetchPage({
    required int page,
    required List<Product> previous,
  }) async {
    final apiClient = ref.read(apiClientProvider);
    final response = await apiClient.dio.get(
      ApiEndpoints.onSaleProducts,
      queryParameters: {'page': page, 'size': 24},
    );
    final pageData = PageResponse.fromJson(
      response.data['data'] as Map<String, dynamic>,
      (json) => Product.fromJson(json),
    );
    return ProductFeed(
      products: [...previous, ...pageData.content],
      page: pageData.page,
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      last: pageData.last,
    );
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || current.last || current.loadingMore) return;

    state = AsyncData(current.copyWith(loadingMore: true));
    try {
      final next = await _fetchPage(page: current.page + 1, previous: current.products);
      state = AsyncData(next);
    } catch (_) {
      state = AsyncData(current.copyWith(loadingMore: false));
    }
  }
}
