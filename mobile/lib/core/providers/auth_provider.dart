import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/user.dart';
import '../network/auth_token_storage.dart';

class AuthState {
  final User? user;
  final String? accessToken;
  final String? refreshToken;
  final bool isAuthenticated;
  final bool isAdmin;
  final bool isLoading;

  const AuthState({
    this.user,
    this.accessToken,
    this.refreshToken,
    this.isAuthenticated = false,
    this.isAdmin = false,
    this.isLoading = true,
  });

  AuthState copyWith({
    User? user,
    String? accessToken,
    String? refreshToken,
    bool? isAuthenticated,
    bool? isAdmin,
    bool? isLoading,
  }) {
    return AuthState(
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isAdmin: isAdmin ?? this.isAdmin,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  static const initial = AuthState();
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthTokenStorage _tokenStorage;
  final SharedPreferences _prefs;

  static const _userKey = 'jaee_user';

  AuthNotifier(this._tokenStorage, this._prefs) : super(const AuthState()) {
    _loadSavedState();
  }

  Future<void> _loadSavedState() async {
    final accessToken = await _tokenStorage.getAccessToken();
    final refreshToken = await _tokenStorage.getRefreshToken();
    final userJson = _prefs.getString(_userKey);

    if (accessToken != null && refreshToken != null && userJson != null) {
      final user = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
      state = AuthState(
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
        isAuthenticated: true,
        isAdmin: user.isAdmin,
        isLoading: false,
      );
    } else {
      state = const AuthState(isLoading: false);
    }
  }

  Future<void> login(User user, String accessToken, String refreshToken) async {
    await _tokenStorage.saveTokens(accessToken: accessToken, refreshToken: refreshToken);
    await _prefs.setString(_userKey, jsonEncode(user.toJson()));
    state = AuthState(
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
      isAuthenticated: true,
      isAdmin: user.isAdmin,
      isLoading: false,
    );
  }

  Future<void> setTokens(String accessToken, String refreshToken) async {
    await _tokenStorage.saveTokens(accessToken: accessToken, refreshToken: refreshToken);
    state = state.copyWith(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
  }

  void setUser(User user) {
    _prefs.setString(_userKey, jsonEncode(user.toJson()));
    state = state.copyWith(
      user: user,
      isAuthenticated: true,
      isAdmin: user.isAdmin,
    );
  }

  void updateUser(Map<String, dynamic> updates) {
    if (state.user == null) return;
    final updated = state.user!.copyWith(
      name: updates['name'] as String? ?? state.user!.name,
      email: updates['email'] as String? ?? state.user!.email,
      mobileNumber: updates['mobileNumber'] as String? ?? state.user!.mobileNumber,
      twoFactorEnabled: updates['twoFactorEnabled'] as bool? ?? state.user!.twoFactorEnabled,
    );
    _prefs.setString(_userKey, jsonEncode(updated.toJson()));
    state = state.copyWith(user: updated);
  }

  Future<void> logout() async {
    await _tokenStorage.clearTokens();
    await _prefs.remove(_userKey);
    state = const AuthState(isLoading: false);
  }
}

final authTokenStorageProvider = Provider<AuthTokenStorage>((ref) {
  return AuthTokenStorage();
});

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('Must be overridden with actual SharedPreferences instance');
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final tokenStorage = ref.watch(authTokenStorageProvider);
  final prefs = ref.watch(sharedPreferencesProvider);
  return AuthNotifier(tokenStorage, prefs);
});
