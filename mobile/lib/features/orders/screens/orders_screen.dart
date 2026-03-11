import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/empty_state.dart';
import '../providers/order_providers.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});
  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  int _page = 0;

  Color _statusColor(String status) {
    return switch (status) {
      'PAID' => AppColors.success,
      'SHIPPED' => const Color(0xFF3B82F6),
      'FULFILLED' => AppColors.success,
      'CANCELLED' => AppColors.error,
      _ => AppColors.warning,
    };
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(ordersProvider(_page));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('My Orders', style: AppTypography.h4), centerTitle: true),
      body: ordersAsync.when(
        data: (page) {
          if (page.content.isEmpty) {
            return EmptyState(
              icon: Icons.receipt_long_outlined,
              title: 'No orders yet',
              subtitle: 'Your order history will appear here',
              actionLabel: 'Start Shopping',
              onAction: () => context.go('/shop'),
            );
          }
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: page.content.length,
                  itemBuilder: (_, i) {
                    final order = page.content[i];
                    return GestureDetector(
                      onTap: () => context.push('/orders/${order.id}'),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.softWhite,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.divider, width: 0.5),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Order #${order.id}', style: AppTypography.labelMedium),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: _statusColor(order.status).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    order.status,
                                    style: AppTypography.caption.copyWith(
                                      color: _statusColor(order.status),
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(Formatters.formatDate(order.createdAt), style: AppTypography.caption),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${order.items.length} item(s)', style: AppTypography.bodySmall),
                                Text(Formatters.formatPrice(order.totalAmount), style: AppTypography.price.copyWith(fontSize: 16)),
                              ],
                            ),
                          ],
                        ),
                      ),
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
                        onPressed: page.first ? null : () => setState(() => _page--),
                        icon: const Icon(Icons.chevron_left),
                      ),
                      Text('${page.page + 1} / ${page.totalPages}', style: AppTypography.labelMedium),
                      IconButton(
                        onPressed: page.last ? null : () => setState(() => _page++),
                        icon: const Icon(Icons.chevron_right),
                      ),
                    ],
                  ),
                ),
            ],
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: ApiException.getErrorMessage(e),
          onRetry: () => ref.invalidate(ordersProvider(_page)),
        ),
      ),
    );
  }
}
