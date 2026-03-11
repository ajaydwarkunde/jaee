import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../models/address.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../providers/checkout_providers.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int? _selectedAddressId;
  bool _isPlacingOrder = false;
  String? _error;

  Future<void> _placeOrder() async {
    if (_selectedAddressId == null) {
      setState(() => _error = 'Please select a delivery address');
      return;
    }
    setState(() { _isPlacingOrder = true; _error = null; });

    try {
      final apiClient = ref.read(apiClientProvider);
      final response = await apiClient.dio.post(ApiEndpoints.createOrder, data: {
        'addressId': _selectedAddressId,
      });
      final orderData = response.data['data'];
      final razorpayOrderId = orderData['razorpayOrderId'] as String;
      final amount = orderData['amount'] as int;

      _openRazorpay(razorpayOrderId, amount);
    } catch (e) {
      setState(() => _error = ApiException.getErrorMessage(e));
      setState(() => _isPlacingOrder = false);
    }
  }

  void _openRazorpay(String orderId, int amount) {
    // Razorpay integration placeholder
    // In production, use razorpay_flutter package:
    // var options = {
    //   'key': AppConfig.razorpayKeyId,
    //   'amount': amount,
    //   'order_id': orderId,
    //   'name': 'Jaee',
    //   'description': 'Order Payment',
    //   'prefill': { 'contact': '', 'email': '' },
    // };
    // _razorpay.open(options);

    // For now, show a placeholder
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Payment'),
        content: Text('Razorpay order created: $orderId\nAmount: $amount paise\n\nRazorpay SDK integration required.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
        ],
      ),
    ).then((_) => setState(() => _isPlacingOrder = false));
  }

  @override
  Widget build(BuildContext context) {
    final addressesAsync = ref.watch(addressesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Checkout', style: AppTypography.h4), centerTitle: true),
      body: addressesAsync.when(
        data: (addresses) => _buildContent(addresses),
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: ApiException.getErrorMessage(e),
          onRetry: () => ref.invalidate(addressesProvider),
        ),
      ),
    );
  }

  Widget _buildContent(List<Address> addresses) {
    if (_selectedAddressId == null && addresses.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          final defaultAddr = addresses.where((a) => a.isDefault).firstOrNull;
          setState(() => _selectedAddressId = defaultAddr?.id ?? addresses.first.id);
        }
      });
    }

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Delivery Address', style: AppTypography.h5),
                const SizedBox(height: 12),

                if (addresses.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.softWhite,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Column(
                      children: [
                        Text('No addresses found', style: AppTypography.bodyMedium),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () => context.push('/addresses'),
                          child: const Text('Add Address'),
                        ),
                      ],
                    ),
                  )
                else
                  ...addresses.map((addr) => GestureDetector(
                    onTap: () => setState(() => _selectedAddressId = addr.id),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.only(bottom: 8),
                      decoration: BoxDecoration(
                        color: AppColors.softWhite,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _selectedAddressId == addr.id ? AppColors.rose : AppColors.divider,
                          width: _selectedAddressId == addr.id ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _selectedAddressId == addr.id
                                ? Icons.radio_button_checked
                                : Icons.radio_button_unchecked,
                            color: _selectedAddressId == addr.id ? AppColors.rose : AppColors.warmGray,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (addr.isDefault)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    margin: const EdgeInsets.only(bottom: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.rose.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text('Default', style: AppTypography.caption.copyWith(color: AppColors.rose)),
                                  ),
                                Text(addr.fullAddress, style: AppTypography.bodySmall),
                                if (addr.phone != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(addr.phone!, style: AppTypography.caption),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  )),

                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.error)),
                  ),
                ],
              ],
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: AppColors.softWhite,
            border: Border(top: BorderSide(color: AppColors.divider)),
          ),
          child: AppButton(
            label: 'Place Order',
            onPressed: _placeOrder,
            isLoading: _isPlacingOrder,
          ),
        ),
      ],
    );
  }
}
