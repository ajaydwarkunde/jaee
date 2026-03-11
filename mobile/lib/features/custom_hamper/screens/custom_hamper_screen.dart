import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/loading_indicator.dart';
import '../../../shared/widgets/error_view.dart';
import '../../../models/builder_option.dart';
import '../providers/hamper_providers.dart';

class CustomHamperScreen extends ConsumerStatefulWidget {
  const CustomHamperScreen({super.key});
  @override
  ConsumerState<CustomHamperScreen> createState() => _CustomHamperScreenState();
}

class _CustomHamperScreenState extends ConsumerState<CustomHamperScreen> {
  int _step = 0;
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();
  int _quantity = 1;
  bool _isSubmitting = false;

  final Map<String, String?> _selections = {
    'SIZE': null,
    'OCCASION': null,
    'ITEMS': null,
    'WRAPPING': null,
    'COLOR_THEME': null,
  };

  final _steps = ['Size', 'Occasion', 'Items', 'Wrapping', 'Theme', 'Details', 'Review'];

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  List<BuilderOption> _optionsForType(List<BuilderOption> all, String type) {
    return all.where((o) => o.optionType == type).toList()
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    try {
      await ref.read(apiClientProvider).dio.post(ApiEndpoints.giftHampers, data: {
        'customerName': _nameController.text.trim(),
        'customerEmail': _emailController.text.trim(),
        'hamperSize': _selections['SIZE'],
        'occasion': _selections['OCCASION'],
        'items': _selections['ITEMS'],
        'wrapping': _selections['WRAPPING'],
        'colorTheme': _selections['COLOR_THEME'],
        'quantity': _quantity,
      });
      if (mounted) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Request Submitted!'),
            content: const Text('We\'ll get back to you soon with a quote for your hamper.'),
            actions: [
              TextButton(onPressed: () { Navigator.pop(context); context.go('/'); }, child: const Text('OK')),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ApiException.getErrorMessage(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final optionsAsync = ref.watch(hamperOptionsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Gift Hamper', style: AppTypography.h4), centerTitle: true),
      body: optionsAsync.when(
        data: (options) => Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: List.generate(_steps.length, (i) => Expanded(
                  child: Container(
                    height: 4,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: i <= _step ? AppColors.rose : AppColors.divider,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                )),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Text('Step ${_step + 1}: ${_steps[_step]}', style: AppTypography.labelMedium),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: _buildStep(options),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.softWhite,
                border: Border(top: BorderSide(color: AppColors.divider)),
              ),
              child: Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: AppButton(label: 'Back', variant: AppButtonVariant.outlined, onPressed: () => setState(() => _step--)),
                    ),
                  if (_step > 0) const SizedBox(width: 12),
                  Expanded(
                    child: _step == _steps.length - 1
                        ? AppButton(label: 'Submit', onPressed: _submit, isLoading: _isSubmitting)
                        : AppButton(label: 'Next', onPressed: () => setState(() => _step++)),
                  ),
                ],
              ),
            ),
          ],
        ),
        loading: () => const LoadingIndicator(),
        error: (e, _) => ErrorView(
          message: ApiException.getErrorMessage(e),
          onRetry: () => ref.invalidate(hamperOptionsProvider),
        ),
      ),
    );
  }

  Widget _buildStep(List<BuilderOption> options) {
    switch (_step) {
      case 0: return _buildOptionGrid(options, 'SIZE');
      case 1: return _buildOptionGrid(options, 'OCCASION');
      case 2: return _buildOptionGrid(options, 'ITEMS');
      case 3: return _buildOptionGrid(options, 'WRAPPING');
      case 4: return _buildOptionGrid(options, 'COLOR_THEME');
      case 5: return _buildDetailsStep();
      case 6: return _buildReviewStep();
      default: return const SizedBox();
    }
  }

  Widget _buildOptionGrid(List<BuilderOption> allOptions, String type) {
    final opts = _optionsForType(allOptions, type);
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: opts.map((opt) {
        final selected = _selections[type] == opt.optionKey;
        return GestureDetector(
          onTap: () => setState(() => _selections[type] = opt.optionKey),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              color: selected ? AppColors.rose : AppColors.softWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: selected ? AppColors.rose : AppColors.divider),
            ),
            child: Column(
              children: [
                Text(opt.label, style: AppTypography.labelMedium.copyWith(color: selected ? Colors.white : AppColors.charcoal)),
                if (opt.surcharge != null && opt.surcharge! > 0)
                  Text('+₹${opt.surcharge!.toStringAsFixed(0)}', style: AppTypography.caption.copyWith(color: selected ? Colors.white70 : AppColors.warmGray)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppTextField(controller: _nameController, label: 'Your Name', prefixIcon: Icons.person_outlined),
        const SizedBox(height: 12),
        AppTextField(controller: _emailController, label: 'Email', prefixIcon: Icons.email_outlined, keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 12),
        AppTextField(controller: _messageController, label: 'Message (optional)', hint: 'Add a personal message', maxLines: 3),
        const SizedBox(height: 12),
        Row(
          children: [
            Text('Quantity:', style: AppTypography.labelMedium),
            const SizedBox(width: 12),
            IconButton(onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null, icon: const Icon(Icons.remove_circle_outline)),
            Text('$_quantity', style: AppTypography.labelLarge),
            IconButton(onPressed: () => setState(() => _quantity++), icon: const Icon(Icons.add_circle_outline)),
          ],
        ),
      ],
    );
  }

  Widget _buildReviewStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Review Your Gift Hamper', style: AppTypography.h5),
        const SizedBox(height: 16),
        _ReviewRow(label: 'Size', value: _selections['SIZE']),
        _ReviewRow(label: 'Occasion', value: _selections['OCCASION']),
        _ReviewRow(label: 'Items', value: _selections['ITEMS']),
        _ReviewRow(label: 'Wrapping', value: _selections['WRAPPING']),
        _ReviewRow(label: 'Theme', value: _selections['COLOR_THEME']),
        _ReviewRow(label: 'Quantity', value: '$_quantity'),
        _ReviewRow(label: 'Name', value: _nameController.text),
        _ReviewRow(label: 'Email', value: _emailController.text),
        if (_messageController.text.isNotEmpty)
          _ReviewRow(label: 'Message', value: _messageController.text),
      ],
    );
  }
}

class _ReviewRow extends StatelessWidget {
  final String label;
  final String? value;
  const _ReviewRow({required this.label, this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: AppTypography.labelSmall)),
          Expanded(child: Text(value ?? 'Not selected', style: AppTypography.bodySmall)),
        ],
      ),
    );
  }
}
