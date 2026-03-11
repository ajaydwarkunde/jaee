import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../auth/providers/auth_providers.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    if (!auth.isAuthenticated) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: Text('Account', style: AppTypography.h4), centerTitle: true),
        body: EmptyState(
          icon: Icons.person_outline,
          title: 'Sign in to your account',
          subtitle: 'View orders, manage addresses, and more',
          actionLabel: 'Sign In',
          onAction: () => context.push('/login'),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text('Account', style: AppTypography.h4), centerTitle: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User info card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.softWhite,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 36,
                    backgroundColor: AppColors.blush,
                    child: Text(
                      (auth.user?.name ?? 'U')[0].toUpperCase(),
                      style: AppTypography.h3.copyWith(color: AppColors.rose),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(auth.user?.name ?? 'User', style: AppTypography.h5),
                  if (auth.user?.email != null)
                    Text(auth.user!.email!, style: AppTypography.bodySmall.copyWith(color: AppColors.warmGray)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Menu items
            _MenuItem(icon: Icons.person_outline, title: 'Profile', onTap: () => context.push('/profile')),
            _MenuItem(icon: Icons.receipt_long_outlined, title: 'My Orders', onTap: () => context.push('/orders')),
            _MenuItem(icon: Icons.location_on_outlined, title: 'Addresses', onTap: () => context.push('/addresses')),
            _MenuItem(icon: Icons.favorite_outline, title: 'Wishlist', onTap: () => context.go('/wishlist')),

            if (auth.isAdmin) ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              _MenuItem(
                icon: Icons.admin_panel_settings_outlined,
                title: 'Admin Dashboard',
                onTap: () => context.push('/admin'),
              ),
            ],

            const SizedBox(height: 24),
            AppButton(
              label: 'Sign Out',
              variant: AppButtonVariant.outlined,
              onPressed: () async {
                final refreshToken = ref.read(authProvider).refreshToken;
                await ref.read(authServiceProvider).logout(refreshToken: refreshToken);
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) context.go('/');
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _MenuItem({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.softWhite,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.charcoal, size: 22),
            const SizedBox(width: 14),
            Expanded(child: Text(title, style: AppTypography.labelMedium)),
            const Icon(Icons.chevron_right, color: AppColors.warmGray, size: 22),
          ],
        ),
      ),
    );
  }
}
