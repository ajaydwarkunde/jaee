import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../providers/auth_providers.dart';
import '../providers/auth_service.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpEmailController = TextEditingController();
  final _otpCodeController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _otpSent = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _otpEmailController.dispose();
    _otpCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin(AuthResponse authResponse) async {
    await ref.read(authProvider.notifier).login(
      authResponse.user,
      authResponse.accessToken,
      authResponse.refreshToken,
    );

    final guestCart = ref.read(guestCartProvider);
    if (guestCart.isNotEmpty) {
      try {
        final apiClient = ref.read(apiClientProvider);
        await apiClient.dio.post(ApiEndpoints.mergeCart, data: {
          'guestItems': guestCart.map((e) => e.toJson()).toList(),
        });
        ref.read(guestCartProvider.notifier).clear();
      } catch (_) {}
    }

    if (mounted) context.go('/');
  }

  Future<void> _loginWithEmail() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() { _isLoading = true; _error = null; });

    try {
      final authService = ref.read(authServiceProvider);
      final response = await authService.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      await _handleLogin(response);
    } catch (e) {
      setState(() => _error = ApiException.getErrorMessage(e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _requestEmailOtp() async {
    final email = _otpEmailController.text.trim();
    if (email.isEmpty) return;
    setState(() { _isLoading = true; _error = null; });

    try {
      final authService = ref.read(authServiceProvider);
      await authService.requestEmailOtp(email: email);
      setState(() => _otpSent = true);
    } catch (e) {
      setState(() => _error = ApiException.getErrorMessage(e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyEmailOtp() async {
    setState(() { _isLoading = true; _error = null; });

    try {
      final authService = ref.read(authServiceProvider);
      final response = await authService.verifyEmailOtp(
        email: _otpEmailController.text.trim(),
        otp: _otpCodeController.text.trim(),
      );
      await _handleLogin(response);
    } catch (e) {
      setState(() => _error = ApiException.getErrorMessage(e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loginWithGoogle() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final authService = ref.read(authServiceProvider);
      final response = await authService.loginWithGoogle();
      await _handleLogin(response);
    } catch (e) {
      setState(() => _error = ApiException.getErrorMessage(e));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Welcome Back', style: AppTypography.h3),
              const SizedBox(height: 8),
              Text(
                'Sign in to continue shopping',
                style: AppTypography.bodyMedium.copyWith(color: AppColors.warmGray),
              ),
              const SizedBox(height: 32),

              Container(
                decoration: BoxDecoration(
                  color: AppColors.cream,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicatorSize: TabBarIndicatorSize.tab,
                  indicator: BoxDecoration(
                    color: AppColors.softWhite,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  labelColor: AppColors.rose,
                  unselectedLabelColor: AppColors.warmGray,
                  labelStyle: AppTypography.labelMedium,
                  dividerColor: Colors.transparent,
                  tabs: const [
                    Tab(text: 'Email'),
                    Tab(text: 'Email OTP'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              if (_error != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _error!,
                    style: AppTypography.bodySmall.copyWith(color: AppColors.error),
                  ),
                ),

              SizedBox(
                height: 280,
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Email + Password tab
                    Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          AppTextField(
                            controller: _emailController,
                            label: 'Email',
                            hint: 'Enter your email',
                            prefixIcon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            validator: (v) => v == null || v.isEmpty ? 'Email is required' : null,
                          ),
                          const SizedBox(height: 16),
                          AppTextField(
                            controller: _passwordController,
                            label: 'Password',
                            hint: 'Enter your password',
                            prefixIcon: Icons.lock_outlined,
                            obscureText: _obscurePassword,
                            textInputAction: TextInputAction.done,
                            validator: (v) => v == null || v.isEmpty ? 'Password is required' : null,
                            suffix: IconButton(
                              icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, size: 20),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => context.push('/forgot-password'),
                              child: const Text('Forgot Password?'),
                            ),
                          ),
                          const SizedBox(height: 8),
                          AppButton(
                            label: 'Sign In',
                            onPressed: _loginWithEmail,
                            isLoading: _isLoading,
                          ),
                        ],
                      ),
                    ),

                    // Email OTP tab
                    Column(
                      children: [
                        AppTextField(
                          controller: _otpEmailController,
                          label: 'Email',
                          hint: 'Enter your email',
                          prefixIcon: Icons.email_outlined,
                          keyboardType: TextInputType.emailAddress,
                          enabled: !_otpSent,
                        ),
                        const SizedBox(height: 16),
                        if (_otpSent) ...[
                          AppTextField(
                            controller: _otpCodeController,
                            label: 'OTP Code',
                            hint: 'Enter 6-digit code',
                            prefixIcon: Icons.pin_outlined,
                            keyboardType: TextInputType.number,
                            textInputAction: TextInputAction.done,
                          ),
                          const SizedBox(height: 16),
                          AppButton(
                            label: 'Verify OTP',
                            onPressed: _verifyEmailOtp,
                            isLoading: _isLoading,
                          ),
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: () => setState(() { _otpSent = false; _otpCodeController.clear(); }),
                            child: const Text('Change Email'),
                          ),
                        ] else
                          AppButton(
                            label: 'Send OTP',
                            onPressed: _requestEmailOtp,
                            isLoading: _isLoading,
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              Row(
                children: [
                  const Expanded(child: Divider()),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text('or', style: AppTypography.bodySmall.copyWith(color: AppColors.warmGray)),
                  ),
                  const Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 16),

              AppButton(
                label: 'Continue with Google',
                variant: AppButtonVariant.outlined,
                icon: Icons.g_mobiledata,
                onPressed: _loginWithGoogle,
              ),
              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Don't have an account? ", style: AppTypography.bodySmall),
                  GestureDetector(
                    onTap: () => context.push('/register'),
                    child: Text('Sign Up', style: AppTypography.labelMedium.copyWith(color: AppColors.rose)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
