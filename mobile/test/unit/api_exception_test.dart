import 'package:flutter_test/flutter_test.dart';
import 'package:jaee/core/network/api_exception.dart';

void main() {
  group('ApiException', () {
    test('stores message and status code', () {
      final exception = ApiException('Something went wrong', 500);
      expect(exception.message, equals('Something went wrong'));
      expect(exception.statusCode, equals(500));
    });

    test('toString returns message', () {
      final exception = ApiException('Not found', 404);
      expect(exception.toString(), equals('Not found'));
    });

    test('status code is optional', () {
      final exception = ApiException('Error');
      expect(exception.statusCode, isNull);
    });
  });

  group('ApiException.getErrorMessage', () {
    test('returns friendly message for known backend error', () {
      expect(
        ApiException.getErrorMessage(ApiException('test')),
        equals('test'),
      );
    });

    test('returns message for generic exception', () {
      final error = Exception('generic error');
      final result = ApiException.getErrorMessage(error);
      expect(result, contains('generic error'));
    });

    test('returns fallback for unknown error type', () {
      final result = ApiException.getErrorMessage('some string');
      expect(result, equals('An unexpected error occurred. Please try again.'));
    });
  });
}
