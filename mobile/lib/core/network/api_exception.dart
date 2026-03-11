import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  static const _friendlyMessages = {
    'Invalid email or password':
        'The email or password you entered is incorrect. Please try again.',
    'Invalid credentials':
        'The email or password you entered is incorrect. Please try again.',
    'Bad credentials':
        'The email or password you entered is incorrect. Please try again.',
    'Email is already registered':
        'This email is already associated with an account. Try signing in instead.',
    'Current password is incorrect':
        'The current password you entered doesn\'t match. Please try again.',
    'Product not found': 'This product is no longer available.',
    'Cart is empty': 'Your cart is empty. Add some items before checking out.',
  };

  static final _friendlyPatterns = <RegExp, String Function(RegExpMatch)>{
    RegExp(r'Insufficient stock\.\s*Available:\s*(\d+)', caseSensitive: false):
        (m) {
      final qty = int.parse(m.group(1)!);
      return qty == 0
          ? 'Sorry, this item is currently out of stock.'
          : 'Sorry, only $qty left in stock. Please reduce the quantity.';
    },
    RegExp(r'quantity exceeds available stock', caseSensitive: false): (_) =>
        'The requested quantity exceeds available stock.',
    RegExp(r'coupon.*expired', caseSensitive: false): (_) =>
        'This coupon has expired.',
    RegExp(r'coupon.*invalid', caseSensitive: false): (_) =>
        'This coupon code is not valid.',
  };

  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      final responseData = error.response?.data;
      String? backendMessage;

      if (responseData is Map<String, dynamic>) {
        backendMessage = responseData['message'] as String?;
      }

      if (backendMessage != null) {
        if (_friendlyMessages.containsKey(backendMessage)) {
          return _friendlyMessages[backendMessage]!;
        }
        for (final entry in _friendlyPatterns.entries) {
          final match = entry.key.firstMatch(backendMessage);
          if (match != null) return entry.value(match);
        }
      }

      final statusCode = error.response?.statusCode;
      if (statusCode == 401) {
        return 'Invalid credentials. Please check your email and password.';
      }
      if (statusCode == 403) {
        return 'You don\'t have permission to perform this action.';
      }
      if (statusCode == 404) {
        return 'The requested resource was not found.';
      }
      if (statusCode == 429) {
        return 'Too many attempts. Please wait a moment and try again.';
      }
      if (statusCode != null && statusCode >= 500) {
        return 'Something went wrong on our end. Please try again later.';
      }

      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.receiveTimeout) {
        return 'Connection timed out. Please check your internet connection.';
      }
      if (error.type == DioExceptionType.connectionError) {
        return 'Unable to connect to the server. Please check your internet connection.';
      }

      return backendMessage ?? 'An error occurred. Please try again.';
    }

    if (error is ApiException) return error.message;
    if (error is Exception) return error.toString();
    return 'An unexpected error occurred. Please try again.';
  }

  @override
  String toString() => message;
}
