import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/api_client_provider.dart';
import '../../../core/config/api_endpoints.dart';
import '../../../models/builder_option.dart';

final hamperOptionsProvider = FutureProvider<List<BuilderOption>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final response = await apiClient.dio.get(ApiEndpoints.builderOptionsActive('HAMPER'));
  final data = response.data['data'] as List<dynamic>;
  return data.map((e) => BuilderOption.fromJson(e as Map<String, dynamic>)).toList();
});
