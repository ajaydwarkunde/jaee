import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/app_config.dart';
import 'auth_token_storage.dart';

class ApiClient {
  late final Dio dio;
  final AuthTokenStorage _tokenStorage;
  VoidCallback? onAuthFailure;
  bool _isRefreshing = false;
  final List<_PendingRequest> _pendingRequests = [];

  ApiClient({required AuthTokenStorage tokenStorage}) : _tokenStorage = tokenStorage {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: _onRequest,
      onError: _onError,
    ));

    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint(obj.toString()),
      ));
    }
  }

  void _onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    if (options.data is FormData) {
      options.headers.remove('Content-Type');
    }
    handler.next(options);
  }

  void _onError(DioException err, ErrorInterceptorHandler handler) async {
    final statusCode = err.response?.statusCode;
    final isAuthError = statusCode == 401 || statusCode == 403;

    if (!isAuthError) {
      handler.next(err);
      return;
    }

    if (err.requestOptions.path.contains('/auth/refresh')) {
      onAuthFailure?.call();
      handler.next(err);
      return;
    }

    if (_isRefreshing) {
      _pendingRequests.add(_PendingRequest(err.requestOptions, handler));
      return;
    }

    _isRefreshing = true;
    final refreshToken = await _tokenStorage.getRefreshToken();

    if (refreshToken == null) {
      _isRefreshing = false;
      onAuthFailure?.call();
      handler.next(err);
      return;
    }

    try {
      final freshDio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
      final response = await freshDio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = response.data['data'];
      final newAccessToken = data['accessToken'] as String;
      final newRefreshToken = data['refreshToken'] as String;

      await _tokenStorage.saveTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );

      err.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
      final retryResponse = await dio.fetch(err.requestOptions);
      handler.resolve(retryResponse);

      for (final pending in _pendingRequests) {
        pending.options.headers['Authorization'] = 'Bearer $newAccessToken';
        dio.fetch(pending.options).then(
          (r) => pending.handler.resolve(r),
          onError: (e) => pending.handler.reject(
            e is DioException
                ? e
                : DioException(requestOptions: pending.options, error: e),
          ),
        );
      }
    } catch (e) {
      onAuthFailure?.call();
      handler.next(err);
      for (final pending in _pendingRequests) {
        pending.handler.reject(
          DioException(requestOptions: pending.options, error: e),
        );
      }
    } finally {
      _isRefreshing = false;
      _pendingRequests.clear();
    }
  }
}

class _PendingRequest {
  final RequestOptions options;
  final ErrorInterceptorHandler handler;
  _PendingRequest(this.options, this.handler);
}
