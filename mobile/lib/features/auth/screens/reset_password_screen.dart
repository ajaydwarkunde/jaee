import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../providers/auth_providers.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String? token;
  const ResetPasswordScreen({super.key, this.token});

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;
  bool _success = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_passwordController.text.length < 6) {
      setState(() => _error = 'Password must be at least 6 characters');
      return;
    }
    if (_passwordController.text != _confirmController.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    setState(() { _isLoading = true; _error = null; });

    try {
      await ref.read(authServiceProvider).resetPassword(
        token: widget.token ?? '',
        newPassword: _passwordController.text,
      );
      setState(() => _success = true);
    } catch (e) {
      setState(() => _error = ApiException.getErrorMessage(e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.token == null || widget.token!.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(backgroundColor: Colors.transparent),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Invalid reset link', style: AppTypography.h5),
              const SizedBox(height: 24),
              AppButton(
                label: 'Go to Login',
                isFullWidth: false,
                onPressed: () => context.go('/login'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(backgroundColor: Colors.transparent),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _success
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle_outline, size: 72, color: AppColors.success),
                    const SizedBox(height: 16),
                    Text('Password Reset Successful', style: AppTypography.h4),
                    const SizedBox(height: 8),
                    Text('You can now sign in with your new password.',
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.warmGray)),
                    const SizedBox(height: 32),
                    AppButton(label: 'Go to Login', onPressed: () => context.go('/login')),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('New Password', style: AppTypography.h3),
                    const SizedBox(height: 8),
                    Text('Enter your new password below.',
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.warmGray)),
                    const SizedBox(height: 32),
                    if (_error != null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.error)),
                      ),
                    AppTextField(
                      controller: _passwordController,
                      label: 'New Password',
                      prefixIcon: Icons.lock_outlined,
                      obscureText: _obscure,
                      suffix: IconButton(
                        icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, size: 20),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                    ),
                    const SizedBox(height: 16),
                    AppTextField(
                      controller: _confirmController,
                      label: 'Confirm Password',
                      prefixIcon: Icons.lock_outlined,
                      obscureText: true,
                    ),
                    const SizedBox(height: 24),
                    AppButton(label: 'Reset Password', onPressed: _submit, isLoading: _isLoading),
                  ],
                ),
        ),
      ),
    );
  }
}
