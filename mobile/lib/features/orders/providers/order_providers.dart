import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_response.dart';
import '../../../models/order.dart';

final ordersProvider = FutureProvider.family<PageResponse<Order>, int>((ref, page) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.orders,
    queryParameters: {'page': page, 'size': 10},
  );
  return PageResponse.fromJson(
    response.data['data'] as Map<String, dynamic>,
    (json) => Order.fromJson(json),
  );
});

final orderDetailProvider = FutureProvider.family<Order, int>((ref, orderId) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.orderById(orderId));
  return Order.fromJson(response.data['data'] as Map<String, dynamic>);
});
