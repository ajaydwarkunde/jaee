import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../providers/order_providers.dart';

class OrderDetailScreen extends ConsumerWidget {
  final int orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Order #$orderId', style: AppTypography.h4), centerTitle: true),
      body: orderAsync.when(
        data: (order) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.softWhite,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Status', style: AppTypography.labelMedium),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.rose.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(order.status, style: AppTypography.labelSmall.copyWith(color: AppColors.rose)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Placed on ${Formatters.formatDateTime(order.createdAt)}', style: AppTypography.caption),
                    if (order.paidAt != null)
                      Text('Paid on ${Formatters.formatDateTime(order.paidAt!)}', style: AppTypography.caption),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Tracking
              if (order.trackingNumber != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.softWhite,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tracking', style: AppTypography.labelMedium),
                      const SizedBox(height: 8),
                      if (order.carrier != null) Text('Carrier: ${order.carrier}', style: AppTypography.bodySmall),
                      Text('Tracking #: ${order.trackingNumber}', style: AppTypography.bodySmall),
                      if (order.trackingUrl != null) ...[
                        const SizedBox(height: 8),
                        GestureDetector(
                          onTap: () => launchUrl(Uri.parse(order.trackingUrl!)),
                          child: Text('Track Package', style: AppTypography.labelMedium.copyWith(color: AppColors.rose)),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Items
              Text('Items', style: AppTypography.h5),
              const SizedBox(height: 8),
              ...order.items.map((item) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.softWhite,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: item.imageUrl != null
                          ? CachedNetworkImage(imageUrl: item.imageUrl!, width: 60, height: 60, fit: BoxFit.cover)
                          : Container(width: 60, height: 60, color: AppColors.cream, child: const Icon(Icons.image_outlined)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, style: AppTypography.labelMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Text('Qty: ${item.qty}  x  ${Formatters.formatPrice(item.price)}', style: AppTypography.caption),
                        ],
                      ),
                    ),
                    Text(Formatters.formatPrice(item.subtotal), style: AppTypography.labelMedium),
                  ],
                ),
              )),

              const SizedBox(height: 16),
              // Total
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.softWhite,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total', style: AppTypography.h5),
                    Text(Formatters.formatPrice(order.totalAmount), style: AppTypography.price),
                  ],
                ),
              ),

              // Shipping address
              if (order.shippingAddress != null) ...[
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.softWhite,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Shipping Address', style: AppTypography.labelMedium),
                      const SizedBox(height: 8),
                      Text(order.shippingAddress!, style: AppTypography.bodySmall.copyWith(color: AppColors.warmGray)),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: ApiException.getErrorMessage(e),
          onRetry: () => ref.invalidate(orderDetailProvider(orderId)),
        ),
      ),
    );
  }
}
