import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/empty_state.dart';
import '../providers/admin_providers.dart';

class AdminOrdersScreen extends ConsumerStatefulWidget {
  const AdminOrdersScreen({super.key});
  @override
  ConsumerState<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends ConsumerState<AdminOrdersScreen> {
  String? _statusFilter;
  int _page = 0;

  final _statuses = ['PENDING', 'PAID', 'SHIPPED', 'FULFILLED', 'CANCELLED'];

  Color _statusColor(String status) {
    return switch (status) {
      'PAID' => AppColors.success,
      'SHIPPED' => const Color(0xFF3B82F6),
      'FULFILLED' => AppColors.success,
      'CANCELLED' => AppColors.error,
      _ => AppColors.warning,
    };
  }

  Future<void> _updateStatus(int orderId, String newStatus) async {
    try {
      await ref.read(apiClientProvider).dio.patch(
        ApiEndpoints.adminOrderStatus(orderId),
        data: {'status': newStatus},
      );
      ref.invalidate(adminOrdersProvider);
      ref.invalidate(adminOrderStatsProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.getErrorMessage(e))),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(adminOrdersProvider((page: _page, status: _statusFilter)));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Manage Orders', style: AppTypography.h4), centerTitle: true),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              children: [
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: const Text('All'),
                    selected: _statusFilter == null,
                    onSelected: (_) => setState(() { _statusFilter = null; _page = 0; }),
                    selectedColor: AppColors.rose,
                    labelStyle: TextStyle(color: _statusFilter == null ? Colors.white : AppColors.charcoal),
                    checkmarkColor: Colors.white,
                  ),
                ),
                ..._statuses.map((s) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(s),
                    selected: _statusFilter == s,
                    onSelected: (_) => setState(() { _statusFilter = s; _page = 0; }),
                    selectedColor: _statusColor(s),
                    labelStyle: TextStyle(color: _statusFilter == s ? Colors.white : AppColors.charcoal),
                    checkmarkColor: Colors.white,
                  ),
                )),
              ],
            ),
          ),
          Expanded(
            child: ordersAsync.when(
              data: (page) {
                if (page.content.isEmpty) {
                  return const EmptyState(icon: Icons.receipt_long_outlined, title: 'No orders found');
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: page.content.length,
                  itemBuilder: (_, i) {
                    final order = page.content[i];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.softWhite,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text('#${order.id}', style: AppTypography.labelMedium),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: _statusColor(order.status).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(order.status, style: AppTypography.caption.copyWith(color: _statusColor(order.status), fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          if (order.userName != null) Text(order.userName!, style: AppTypography.bodySmall),
                          Text(Formatters.formatDate(order.createdAt), style: AppTypography.caption),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Text(Formatters.formatPrice(order.totalAmount), style: AppTypography.price.copyWith(fontSize: 16)),
                              const Spacer(),
                              PopupMenuButton<String>(
                                onSelected: (s) => _updateStatus(order.id, s),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.divider),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text('Update', style: AppTypography.labelSmall),
                                      const Icon(Icons.arrow_drop_down, size: 18),
                                    ],
                                  ),
                                ),
                                itemBuilder: (_) => _statuses
                                    .where((s) => s != order.status)
                                    .map((s) => PopupMenuItem(value: s, child: Text(s)))
                                    .toList(),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
              loading: () => const LoadingIndicator(),
              error: (e, _) => ErrorView(message: 'Failed to load orders', onRetry: () => ref.invalidate(adminOrdersProvider)),
            ),
          ),
        ],
      ),
    );
  }
}
