import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../models/cart.dart';

final serverCartProvider = FutureProvider<Cart?>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  try {
    final response = await apiClient.dio.get(ApiEndpoints.cart);
    return Cart.fromJson(response.data['data'] as Map<String, dynamic>);
  } catch (_) {
    return null;
  }
});
