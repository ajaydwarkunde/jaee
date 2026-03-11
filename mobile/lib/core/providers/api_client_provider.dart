import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/api_client.dart';
import '../network/auth_token_storage.dart';
import 'auth_provider.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  final tokenStorage = ref.watch(authTokenStorageProvider);
  final apiClient = ApiClient(tokenStorage: tokenStorage);

  apiClient.onAuthFailure = () {
    ref.read(authProvider.notifier).logout();
  };

  return apiClient;
});
