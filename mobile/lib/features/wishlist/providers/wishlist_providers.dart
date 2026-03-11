import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../models/product.dart';

final wishlistProvider = FutureProvider<List<Product>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.wishlist);
  final data = response.data['data'] as List<dynamic>;
  return data.map((e) {
    final json = e as Map<String, dynamic>;
    return Product.fromJson(json['product'] as Map<String, dynamic>);
  }).toList();
});

final wishlistIdsProvider = FutureProvider<Set<int>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.wishlistProductIds);
  final data = response.data['data'] as List<dynamic>;
  return data.map((e) => e as int).toSet();
});
