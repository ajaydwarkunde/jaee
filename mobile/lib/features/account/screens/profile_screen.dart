import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/utils/password_encoder.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  late final TextEditingController _nameController;
  final _currentPwController = TextEditingController();
  final _newPwController = TextEditingController();
  bool _isUpdating = false;
  bool _isChangingPassword = false;
  String? _message;
  String? _pwMessage;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: ref.read(authProvider).user?.name ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _currentPwController.dispose();
    _newPwController.dispose();
    super.dispose();
  }

  Future<void> _updateProfile() async {
    setState(() { _isUpdating = true; _message = null; });
    try {
      await ref.read(apiClientProvider).dio.put(
        ApiEndpoints.updateProfile,
        data: {'name': _nameController.text.trim()},
      );
      ref.read(authProvider.notifier).updateUser({'name': _nameController.text.trim()});
      setState(() => _message = 'Profile updated successfully');
    } catch (e) {
      setState(() => _message = ApiException.getErrorMessage(e));
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  Future<void> _changePassword() async {
    if (_currentPwController.text.isEmpty || _newPwController.text.isEmpty) return;
    setState(() { _isChangingPassword = true; _pwMessage = null; });
    try {
      await ref.read(apiClientProvider).dio.post(
        ApiEndpoints.changePassword,
        data: {
          'currentPassword': PasswordEncoder.encode(_currentPwController.text),
          'newPassword': PasswordEncoder.encode(_newPwController.text),
        },
      );
      _currentPwController.clear();
      _newPwController.clear();
      setState(() => _pwMessage = 'Password changed successfully');
    } catch (e) {
      setState(() => _pwMessage = ApiException.getErrorMessage(e));
    } finally {
      if (mounted) setState(() => _isChangingPassword = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Profile', style: AppTypography.h4), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Name
            Text('Personal Information', style: AppTypography.h5),
            const SizedBox(height: 12),
            AppTextField(controller: _nameController, label: 'Full Name', prefixIcon: Icons.person_outlined),
            const SizedBox(height: 8),
            AppTextField(label: 'Email', hint: auth.user?.email ?? '', prefixIcon: Icons.email_outlined, enabled: false),
            const SizedBox(height: 8),
            AppTextField(label: 'Mobile', hint: auth.user?.mobileNumber ?? '', prefixIcon: Icons.phone_outlined, enabled: false),
            if (_message != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(_message!, style: AppTypography.bodySmall.copyWith(color: _message!.contains('success') ? AppColors.success : AppColors.error)),
              ),
            const SizedBox(height: 12),
            AppButton(label: 'Update Profile', onPressed: _updateProfile, isLoading: _isUpdating),

            const SizedBox(height: 32),
            const Divider(),
            const SizedBox(height: 16),

            // Change Password
            Text('Change Password', style: AppTypography.h5),
            const SizedBox(height: 12),
            AppTextField(controller: _currentPwController, label: 'Current Password', prefixIcon: Icons.lock_outlined, obscureText: true),
            const SizedBox(height: 8),
            AppTextField(controller: _newPwController, label: 'New Password', prefixIcon: Icons.lock_outlined, obscureText: true),
            if (_pwMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(_pwMessage!, style: AppTypography.bodySmall.copyWith(color: _pwMessage!.contains('success') ? AppColors.success : AppColors.error)),
              ),
            const SizedBox(height: 12),
            AppButton(label: 'Change Password', variant: AppButtonVariant.outlined, onPressed: _changePassword, isLoading: _isChangingPassword),
          ],
        ),
      ),
    );
  }
}
