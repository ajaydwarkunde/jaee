import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_response.dart';
import '../../../models/product.dart';
import '../../../models/review.dart';

final productBySlugProvider = FutureProvider.family<Product, String>((ref, slug) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.productBySlug(slug));
  return Product.fromJson(response.data['data'] as Map<String, dynamic>);
});

final relatedProductsProvider = FutureProvider.family<List<Product>, int>((ref, productId) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.relatedProducts(productId),
    queryParameters: {'limit': 4},
  );
  final data = response.data['data'] as List<dynamic>;
  return data.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
});

final productReviewsProvider = FutureProvider.family<PageResponse<Review>, int>((ref, productId) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.productReviews(productId),
    queryParameters: {'page': 0, 'size': 5},
  );
  return PageResponse.fromJson(
    response.data['data'] as Map<String, dynamic>,
    (json) => Review.fromJson(json),
  );
});

final reviewSummaryProvider = FutureProvider.family<ReviewSummary, int>((ref, productId) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.reviewSummary(productId));
  return ReviewSummary.fromJson(response.data['data'] as Map<String, dynamic>);
});
