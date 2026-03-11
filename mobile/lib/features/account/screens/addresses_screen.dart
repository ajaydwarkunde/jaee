import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../models/address.dart';
import '../../checkout/providers/checkout_providers.dart';

class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addressesAsync = ref.watch(addressesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Addresses', style: AppTypography.h4), centerTitle: true),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.rose,
        foregroundColor: Colors.white,
        onPressed: () => _showAddressForm(context, ref),
        child: const Icon(Icons.add),
      ),
      body: addressesAsync.when(
        data: (addresses) {
          if (addresses.isEmpty) {
            return const EmptyState(
              icon: Icons.location_on_outlined,
              title: 'No addresses yet',
              subtitle: 'Add an address for delivery',
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: addresses.length,
            itemBuilder: (_, i) {
              final addr = addresses[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
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
                        if (addr.isDefault)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            margin: const EdgeInsets.only(right: 8),
                            decoration: BoxDecoration(
                              color: AppColors.rose.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text('Default', style: AppTypography.caption.copyWith(color: AppColors.rose)),
                          ),
                        const Spacer(),
                        PopupMenuButton<String>(
                          onSelected: (action) async {
                            if (action == 'default') {
                              await ref.read(apiClientProvider).dio.patch(ApiEndpoints.setDefaultAddress(addr.id));
                              ref.invalidate(addressesProvider);
                            } else if (action == 'edit') {
                              _showAddressForm(context, ref, address: addr);
                            } else if (action == 'delete') {
                              await ref.read(apiClientProvider).dio.delete(ApiEndpoints.address(addr.id));
                              ref.invalidate(addressesProvider);
                            }
                          },
                          itemBuilder: (_) => [
                            if (!addr.isDefault) const PopupMenuItem(value: 'default', child: Text('Set as Default')),
                            const PopupMenuItem(value: 'edit', child: Text('Edit')),
                            const PopupMenuItem(value: 'delete', child: Text('Delete')),
                          ],
                        ),
                      ],
                    ),
                    Text(addr.fullAddress, style: AppTypography.bodySmall),
                    if (addr.phone != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(addr.phone!, style: AppTypography.caption),
                      ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: ApiException.getErrorMessage(e),
          onRetry: () => ref.invalidate(addressesProvider),
        ),
      ),
    );
  }

  void _showAddressForm(BuildContext context, WidgetRef ref, {Address? address}) {
    final line1 = TextEditingController(text: address?.line1 ?? '');
    final line2 = TextEditingController(text: address?.line2 ?? '');
    final city = TextEditingController(text: address?.city ?? '');
    final state = TextEditingController(text: address?.state ?? '');
    final zip = TextEditingController(text: address?.zip ?? '');
    final phone = TextEditingController(text: address?.phone ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.softWhite,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(16, 24, 16, MediaQuery.of(ctx).viewInsets.bottom + 16),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(address == null ? 'Add Address' : 'Edit Address', style: AppTypography.h5),
              const SizedBox(height: 16),
              AppTextField(controller: line1, label: 'Address Line 1', hint: 'Street address'),
              const SizedBox(height: 8),
              AppTextField(controller: line2, label: 'Address Line 2', hint: 'Apt, suite (optional)'),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: AppTextField(controller: city, label: 'City')),
                  const SizedBox(width: 8),
                  Expanded(child: AppTextField(controller: state, label: 'State')),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: AppTextField(controller: zip, label: 'ZIP Code', keyboardType: TextInputType.number)),
                  const SizedBox(width: 8),
                  Expanded(child: AppTextField(controller: phone, label: 'Phone', keyboardType: TextInputType.phone)),
                ],
              ),
              const SizedBox(height: 16),
              AppButton(
                label: address == null ? 'Add Address' : 'Update Address',
                onPressed: () async {
                  final data = {
                    'line1': line1.text,
                    'line2': line2.text,
                    'city': city.text,
                    'state': state.text,
                    'country': 'India',
                    'zip': zip.text,
                    'phone': phone.text,
                  };
                  try {
                    if (address == null) {
                      await ref.read(apiClientProvider).dio.post(ApiEndpoints.addresses, data: data);
                    } else {
                      await ref.read(apiClientProvider).dio.put(ApiEndpoints.address(address.id), data: data);
                    }
                    ref.invalidate(addressesProvider);
                    if (ctx.mounted) Navigator.pop(ctx);
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text(ApiException.getErrorMessage(e))),
                      );
                    }
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
