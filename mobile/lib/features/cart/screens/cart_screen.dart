import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../models/cart.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/empty_state.dart';
import '../providers/cart_providers.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final _couponController = TextEditingController();
  String? _couponMessage;
  bool _couponValid = false;
  double _discountAmount = 0;
  bool _isUpdating = false;

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  Future<void> _updateQty(int itemId, int qty) async {
    setState(() => _isUpdating = true);
    try {
      await ref.read(apiClientProvider).dio.patch(
        ApiEndpoints.cartItem(itemId),
        data: {'qty': qty},
      );
      ref.invalidate(serverCartProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.getErrorMessage(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  Future<void> _removeItem(int itemId) async {
    setState(() => _isUpdating = true);
    try {
      await ref.read(apiClientProvider).dio.delete(ApiEndpoints.cartItem(itemId));
      ref.invalidate(serverCartProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.getErrorMessage(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  Future<void> _validateCoupon(double orderAmount) async {
    final code = _couponController.text.trim();
    if (code.isEmpty) return;

    try {
      final response = await ref.read(apiClientProvider).dio.get(
        ApiEndpoints.validateCoupon(code),
        queryParameters: {'orderAmount': orderAmount},
      );
      final data = response.data['data'];
      setState(() {
        _couponValid = data['valid'] == true;
        _couponMessage = data['message'] as String?;
        _discountAmount = _couponValid ? (data['discountAmount'] as num?)?.toDouble() ?? 0 : 0;
      });
    } catch (e) {
      setState(() {
        _couponValid = false;
        _couponMessage = ApiException.getErrorMessage(e);
        _discountAmount = 0;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) return _buildGuestCart();

    final cartAsync = ref.watch(serverCartProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Cart', style: AppTypography.h4), centerTitle: true),
      body: cartAsync.when(
        data: (cart) {
          if (cart == null || cart.items.isEmpty) {
            return EmptyState(
              icon: Icons.shopping_cart_outlined,
              title: 'Your cart is empty',
              subtitle: 'Start shopping to add items',
              actionLabel: 'Shop Now',
              onAction: () => context.go('/shop'),
            );
          }
          return _buildCartContent(cart);
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => EmptyState(
          icon: Icons.shopping_cart_outlined,
          title: 'Your cart is empty',
          actionLabel: 'Shop Now',
          onAction: () => context.go('/shop'),
        ),
      ),
    );
  }

  Widget _buildGuestCart() {
    final guestItems = ref.watch(guestCartProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Cart', style: AppTypography.h4), centerTitle: true),
      body: guestItems.isEmpty
          ? EmptyState(
              icon: Icons.shopping_cart_outlined,
              title: 'Your cart is empty',
              subtitle: 'Start shopping to add items',
              actionLabel: 'Shop Now',
              onAction: () => context.go('/shop'),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: guestItems.length,
                    itemBuilder: (_, i) {
                      final item = guestItems[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
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
                                  Text('Product #${item.productId}', style: AppTypography.labelMedium),
                                  const SizedBox(height: 4),
                                  Text('Qty: ${item.qty}', style: AppTypography.bodySmall),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, size: 22),
                                  onPressed: () => ref.read(guestCartProvider.notifier).updateItem(item.productId, item.qty - 1),
                                ),
                                Text('${item.qty}', style: AppTypography.labelMedium),
                                IconButton(
                                  icon: const Icon(Icons.add_circle_outline, size: 22),
                                  onPressed: () => ref.read(guestCartProvider.notifier).updateItem(item.productId, item.qty + 1),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 22),
                                  onPressed: () => ref.read(guestCartProvider.notifier).removeItem(item.productId),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: AppButton(
                    label: 'Sign in to Checkout',
                    onPressed: () => context.push('/login'),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildCartContent(Cart cart) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: cart.items.length,
            itemBuilder: (_, i) {
              final item = cart.items[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.softWhite,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: item.productImage != null
                          ? CachedNetworkImage(
                              imageUrl: item.productImage!,
                              width: 72, height: 72, fit: BoxFit.cover,
                            )
                          : Container(
                              width: 72, height: 72,
                              color: AppColors.cream,
                              child: const Icon(Icons.image_outlined, color: AppColors.warmGray),
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.productName, style: AppTypography.labelMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Text(Formatters.formatPrice(item.unitPrice), style: AppTypography.bodySmall.copyWith(color: AppColors.warmGray)),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              GestureDetector(
                                onTap: item.qty > 1 ? () => _updateQty(item.id, item.qty - 1) : null,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.divider),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Icon(Icons.remove, size: 16),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: Text('${item.qty}', style: AppTypography.labelMedium),
                              ),
                              GestureDetector(
                                onTap: () => _updateQty(item.id, item.qty + 1),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.divider),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Icon(Icons.add, size: 16),
                                ),
                              ),
                              const Spacer(),
                              Text(Formatters.formatPrice(item.subtotal), style: AppTypography.price.copyWith(fontSize: 16)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                      onPressed: () => _removeItem(item.id),
                    ),
                  ],
                ),
              );
            },
          ),
        ),

        // Coupon & summary
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: AppColors.softWhite,
            border: Border(top: BorderSide(color: AppColors.divider)),
          ),
          child: Column(
            children: [
              // Coupon row
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _couponController,
                      decoration: InputDecoration(
                        hintText: 'Coupon code',
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: () => _validateCoupon(cart.subtotal),
                    child: const Text('Apply'),
                  ),
                ],
              ),
              if (_couponMessage != null) ...[
                const SizedBox(height: 6),
                Text(
                  _couponMessage!,
                  style: AppTypography.caption.copyWith(color: _couponValid ? AppColors.success : AppColors.error),
                ),
              ],
              const SizedBox(height: 12),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Subtotal', style: AppTypography.bodyMedium),
                  Text(Formatters.formatPrice(cart.subtotal), style: AppTypography.labelLarge),
                ],
              ),
              if (_discountAmount > 0) ...[
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Discount', style: AppTypography.bodySmall.copyWith(color: AppColors.success)),
                    Text('-${Formatters.formatPrice(_discountAmount)}', style: AppTypography.labelMedium.copyWith(color: AppColors.success)),
                  ],
                ),
              ],
              const SizedBox(height: 12),
              AppButton(
                label: 'Proceed to Checkout',
                onPressed: () => context.push('/checkout'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
