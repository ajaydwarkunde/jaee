import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../providers/admin_providers.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(adminOrderStatsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Admin Dashboard', style: AppTypography.h4),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            statsAsync.when(
              data: (stats) => Column(
                children: [
                  // Revenue card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [AppColors.rose, AppColors.roseDark]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Total Revenue', style: AppTypography.labelMedium.copyWith(color: Colors.white70)),
                        const SizedBox(height: 4),
                        Text(Formatters.formatPrice(stats.totalRevenue), style: AppTypography.h2.copyWith(color: Colors.white)),
                        const SizedBox(height: 4),
                        Text('${stats.totalOrders} total orders', style: AppTypography.bodySmall.copyWith(color: Colors.white70)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Order stats grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 1.6,
                    children: [
                      _StatCard(label: 'Pending', count: stats.pendingOrders, color: AppColors.warning),
                      _StatCard(label: 'Paid', count: stats.paidOrders, color: AppColors.success),
                      _StatCard(label: 'Shipped', count: stats.shippedOrders, color: const Color(0xFF3B82F6)),
                      _StatCard(label: 'Fulfilled', count: stats.fulfilledOrders, color: AppColors.success),
                    ],
                  ),
                ],
              ),
              loading: () => const LoadingIndicator(),
              error: (_, __) => const SizedBox(),
            ),
            const SizedBox(height: 24),

            Text('Management', style: AppTypography.h5),
            const SizedBox(height: 12),
            _AdminMenuItem(icon: Icons.receipt_long, title: 'Orders', subtitle: 'Manage customer orders', onTap: () => context.push('/admin/orders')),
            _AdminMenuItem(icon: Icons.inventory_2, title: 'Products', subtitle: 'Manage product catalog', onTap: () => context.push('/admin/products')),
            _AdminMenuItem(icon: Icons.category, title: 'Categories', subtitle: 'Manage categories', onTap: () => context.push('/admin/categories')),
            _AdminMenuItem(icon: Icons.local_offer, title: 'Coupons', subtitle: 'Manage discount codes', onTap: () => context.push('/admin/coupons')),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final int count;
  final Color color;

  const _StatCard({required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.softWhite,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: AppTypography.caption),
          const SizedBox(height: 4),
          Text('$count', style: AppTypography.h4.copyWith(color: color)),
        ],
      ),
    );
  }
}

class _AdminMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _AdminMenuItem({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.softWhite,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.blush, borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: AppColors.rose, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.labelMedium),
                  Text(subtitle, style: AppTypography.caption),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.warmGray),
          ],
        ),
      ),
    );
  }
}
