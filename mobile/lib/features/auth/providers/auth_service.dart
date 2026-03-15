import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/password_encoder.dart';
import '../../../models/user.dart';

class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final User user;

  AuthResponse({required this.accessToken, required this.refreshToken, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  Dio get _dio => _apiClient.dio;

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String mobileNumber,
    required String password,
  }) async {
    final response = await _dio.post(ApiEndpoints.register, data: {
      'name': name,
      'email': email,
      'mobileNumber': mobileNumber,
      'password': PasswordEncoder.encode(password),
    });
    return AuthResponse.fromJson(response.data['data']);
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post(ApiEndpoints.login, data: {
      'email': email,
      'password': PasswordEncoder.encode(password),
    });
    return AuthResponse.fromJson(response.data['data']);
  }

  Future<AuthResponse> phoneLogin({required String idToken}) async {
    final response = await _dio.post(ApiEndpoints.phoneLogin, data: {
      'idToken': idToken,
    });
    return AuthResponse.fromJson(response.data['data']);
  }

  Future<AuthResponse> socialLogin({
    required String idToken,
    required String provider,
  }) async {
    final response = await _dio.post(ApiEndpoints.socialLogin, data: {
      'idToken': idToken,
      'provider': provider,
    });
    return AuthResponse.fromJson(response.data['data']);
  }

  Future<AuthResponse> loginWithGoogle() async {
    final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
    final account = await googleSignIn.signIn();
    if (account == null) {
      throw Exception('Google sign-in was cancelled');
    }
    final auth = await account.authentication;
    final idToken = auth.idToken;
    if (idToken == null) {
      throw Exception('Failed to get Google ID token');
    }
    return socialLogin(idToken: idToken, provider: 'GOOGLE');
  }

  Future<void> requestEmailOtp({required String email}) async {
    await _dio.post(ApiEndpoints.requestEmailOtp, data: {'email': email});
  }

  Future<AuthResponse> verifyEmailOtp({
    required String email,
    required String otp,
  }) async {
    final response = await _dio.post(ApiEndpoints.verifyEmailOtp, data: {
      'email': email,
      'otp': otp,
    });
    return AuthResponse.fromJson(response.data['data']);
  }

  Future<void> requestOtp({required String mobileNumber}) async {
    await _dio.post(ApiEndpoints.requestOtp, data: {'mobileNumber': mobileNumber});
  }

  Future<AuthResponse> verifyOtp({
    required String mobileNumber,
    required String otp,
  }) async {
    final response = await _dio.post(ApiEndpoints.verifyOtp, data: {
      'mobileNumber': mobileNumber,
      'otp': otp,
    });
    return AuthResponse.fromJson(response.data['data']);
  }

  Future<void> forgotPassword({required String email}) async {
    await _dio.post(ApiEndpoints.forgotPassword, data: {'email': email});
  }

  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    await _dio.post(ApiEndpoints.resetPassword, data: {
      'token': token,
      'newPassword': PasswordEncoder.encode(newPassword),
    });
  }

  Future<void> logout({String? refreshToken}) async {
    try {
      await _dio.post(ApiEndpoints.logout, data: {
        if (refreshToken != null) 'refreshToken': refreshToken,
      });
    } catch (_) {
      // Ignore logout errors
    }
  }

  Future<User> getCurrentUser() async {
    final response = await _dio.get(ApiEndpoints.me);
    return User.fromJson(response.data['data']);
  }
}
