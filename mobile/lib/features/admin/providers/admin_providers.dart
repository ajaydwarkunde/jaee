import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_response.dart';
import '../../../models/order.dart';

class OrderStats {
  final int totalOrders;
  final int pendingOrders;
  final int paidOrders;
  final int shippedOrders;
  final int fulfilledOrders;
  final int cancelledOrders;
  final double totalRevenue;

  OrderStats({
    required this.totalOrders,
    required this.pendingOrders,
    required this.paidOrders,
    required this.shippedOrders,
    required this.fulfilledOrders,
    required this.cancelledOrders,
    required this.totalRevenue,
  });

  factory OrderStats.fromJson(Map<String, dynamic> json) {
    return OrderStats(
      totalOrders: json['totalOrders'] as int? ?? 0,
      pendingOrders: json['pendingOrders'] as int? ?? 0,
      paidOrders: json['paidOrders'] as int? ?? 0,
      shippedOrders: json['shippedOrders'] as int? ?? 0,
      fulfilledOrders: json['fulfilledOrders'] as int? ?? 0,
      cancelledOrders: json['cancelledOrders'] as int? ?? 0,
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0,
    );
  }
}

final adminOrderStatsProvider = FutureProvider<OrderStats>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.adminOrderStats);
  return OrderStats.fromJson(response.data['data'] as Map<String, dynamic>);
});

final adminOrdersProvider = FutureProvider.family<PageResponse<Order>, ({int page, String? status})>((ref, params) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(
    ApiEndpoints.adminOrders,
    queryParameters: {
      'page': params.page,
      'size': 10,
      if (params.status != null) 'status': params.status,
    },
  );
  return PageResponse.fromJson(
    response.data['data'] as Map<String, dynamic>,
    (json) => Order.fromJson(json),
  );
});
