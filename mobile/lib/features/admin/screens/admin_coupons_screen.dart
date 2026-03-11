import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/empty_state.dart';

class Coupon {
  final int id;
  final String code;
  final String discountType;
  final double discountValue;
  final double? minOrderAmount;
  final int? usageLimit;
  final int usedCount;
  final bool active;

  Coupon({
    required this.id,
    required this.code,
    required this.discountType,
    required this.discountValue,
    this.minOrderAmount,
    this.usageLimit,
    required this.usedCount,
    required this.active,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id'] as int,
      code: json['code'] as String,
      discountType: json['discountType'] as String? ?? 'PERCENTAGE',
      discountValue: (json['discountValue'] as num).toDouble(),
      minOrderAmount: (json['minOrderAmount'] as num?)?.toDouble(),
      usageLimit: json['usageLimit'] as int?,
      usedCount: json['usedCount'] as int? ?? 0,
      active: json['active'] as bool? ?? true,
    );
  }
}

final _adminCouponsProvider = FutureProvider<List<Coupon>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.adminCoupons, queryParameters: {'page': 0, 'size': 50});
  final data = response.data['data'];
  final content = data is Map ? (data['content'] as List<dynamic>) : (data as List<dynamic>);
  return content.map((e) => Coupon.fromJson(e as Map<String, dynamic>)).toList();
});

class AdminCouponsScreen extends ConsumerWidget {
  const AdminCouponsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final couponsAsync = ref.watch(_adminCouponsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Coupons', style: AppTypography.h4), centerTitle: true),
      body: couponsAsync.when(
        data: (coupons) {
          if (coupons.isEmpty) {
            return const EmptyState(icon: Icons.local_offer_outlined, title: 'No coupons');
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: coupons.length,
            itemBuilder: (_, i) {
              final c = coupons[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.softWhite,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(c.code, style: AppTypography.labelLarge),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: c.active ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(c.active ? 'Active' : 'Inactive', style: AppTypography.caption.copyWith(color: c.active ? AppColors.success : AppColors.error)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            c.discountType == 'PERCENTAGE'
                                ? '${c.discountValue.toStringAsFixed(0)}% off'
                                : '₹${c.discountValue.toStringAsFixed(0)} off',
                            style: AppTypography.bodySmall.copyWith(color: AppColors.warmGray),
                          ),
                          Text('Used: ${c.usedCount}${c.usageLimit != null ? '/${c.usageLimit}' : ''}', style: AppTypography.caption),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: AppColors.error),
                      onPressed: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (_) => AlertDialog(
                            title: const Text('Delete Coupon'),
                            content: Text('Delete "${c.code}"?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                              TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: AppColors.error))),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          try {
                            await ref.read(apiClientProvider).dio.delete(ApiEndpoints.adminCoupon(c.id));
                            ref.invalidate(_adminCouponsProvider);
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiException.getErrorMessage(e))));
                            }
                          }
                        }
                      },
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(message: 'Failed to load coupons', onRetry: () => ref.invalidate(_adminCouponsProvider)),
      ),
    );
  }
}
