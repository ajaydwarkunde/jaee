import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/api_response.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../models/product.dart';

final _adminProductsProvider = FutureProvider<PageResponse<Product>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.products, queryParameters: {'page': 0, 'size': 50});
  return PageResponse.fromJson(response.data['data'] as Map<String, dynamic>, (json) => Product.fromJson(json));
});

class AdminProductsScreen extends ConsumerWidget {
  const AdminProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(_adminProductsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Products', style: AppTypography.h4), centerTitle: true),
      body: productsAsync.when(
        data: (page) {
          if (page.content.isEmpty) {
            return const EmptyState(icon: Icons.inventory_2_outlined, title: 'No products');
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: page.content.length,
            itemBuilder: (_, i) {
              final p = page.content[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.softWhite,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: p.primaryImage.isNotEmpty
                          ? CachedNetworkImage(imageUrl: p.primaryImage, width: 56, height: 56, fit: BoxFit.cover)
                          : Container(width: 56, height: 56, color: AppColors.cream, child: const Icon(Icons.image_outlined)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p.name, style: AppTypography.labelMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Text(Formatters.formatPrice(p.price), style: AppTypography.bodySmall),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: p.inStock ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  p.inStock ? 'In Stock (${p.stockQty})' : 'Out of Stock',
                                  style: AppTypography.caption.copyWith(color: p.inStock ? AppColors.success : AppColors.error),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    PopupMenuButton<String>(
                      onSelected: (action) async {
                        if (action == 'delete') {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (_) => AlertDialog(
                              title: const Text('Delete Product'),
                              content: Text('Delete "${p.name}"?'),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                                TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: AppColors.error))),
                              ],
                            ),
                          );
                          if (confirm == true) {
                            try {
                              await ref.read(apiClientProvider).dio.delete(ApiEndpoints.adminProduct(p.id));
                              ref.invalidate(_adminProductsProvider);
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiException.getErrorMessage(e))));
                              }
                            }
                          }
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppColors.error))),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(message: 'Failed to load products', onRetry: () => ref.invalidate(_adminProductsProvider)),
      ),
    );
  }
}
