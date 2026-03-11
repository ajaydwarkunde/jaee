import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/config/app_config.dart';
import '../../../models/product.dart';
import '../../../models/category.dart';

final featuredProductsProvider = FutureProvider<List<Product>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.featuredProducts,
    queryParameters: {'limit': AppConfig.featuredProductsLimit},
  );
  final data = response.data['data'] as List<dynamic>;
  return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
});

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.categories);
  final data = response.data['data'] as List<dynamic>;
  return data.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
});

final onSaleProductsProvider = FutureProvider<List<Product>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.onSaleProducts,
    queryParameters: {'page': 0, 'size': 4},
  );
  final content = response.data['data']['content'] as List<dynamic>;
  return content.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
});
