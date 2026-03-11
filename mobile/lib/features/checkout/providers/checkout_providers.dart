import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../models/address.dart';

final addressesProvider = FutureProvider<List<Address>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.addresses);
  final data = response.data['data'] as List<dynamic>;
  return data.map((e) => Address.fromJson(e as Map<String, dynamic>)).toList();
});
