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
  final int page;
  final int size;

  const ProductFilters({
    this.categoryId,
    this.minPrice,
    this.maxPrice,
    this.search,
    this.sortBy,
    this.sortDir,
    this.page = 0,
    this.size = 12,
  });

  ProductFilters copyWith({
    int? categoryId,
    double? minPrice,
    double? maxPrice,
    String? search,
    String? sortBy,
    String? sortDir,
    int? page,
    int? size,
    bool clearCategory = false,
  }) {
    return ProductFilters(
      categoryId: clearCategory ? null : (categoryId ?? this.categoryId),
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      search: search ?? this.search,
      sortBy: sortBy ?? this.sortBy,
      sortDir: sortDir ?? this.sortDir,
      page: page ?? this.page,
      size: size ?? this.size,
    );
  }

  Map<String, dynamic> toQueryParams() {
    return {
      if (categoryId != null) 'categoryId': categoryId,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
      if (search != null && search!.isNotEmpty) 'search': search,
      if (sortBy != null) 'sortBy': sortBy,
      if (sortDir != null) 'sortDir': sortDir,
      'page': page,
      'size': size,
    };
  }
}

final filtersProvider = StateProvider<ProductFilters>((ref) => const ProductFilters());

final productsProvider = FutureProvider<PageResponse<Product>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final filters = ref.watch(filtersProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.products,
    queryParameters: filters.toQueryParams(),
  );
  return PageResponse.fromJson(
    response.data['data'] as Map<String, dynamic>,
    (json) => Product.fromJson(json),
  );
});

final saleProductsProvider = FutureProvider.family<PageResponse<Product>, int>((ref, page) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.onSaleProducts,
    queryParameters: {'page': page, 'size': 12},
  );
  return PageResponse.fromJson(
    response.data['data'] as Map<String, dynamic>,
    (json) => Product.fromJson(json),
  );
});
