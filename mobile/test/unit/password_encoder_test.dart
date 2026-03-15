import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:jaee/core/utils/password_encoder.dart';

void main() {
  group('PasswordEncoder', () {
    test('encodes password with prefix and base64', () {
      final result = PasswordEncoder.encode('myPassword123');

      expect(result, startsWith('enc:'));
      final encoded = result.substring(4);
      final decoded = utf8.decode(base64Decode(encoded));
      expect(decoded, equals('myPassword123'));
    });

    test('encodes empty string', () {
      final result = PasswordEncoder.encode('');
      expect(result, startsWith('enc:'));
      final decoded = utf8.decode(base64Decode(result.substring(4)));
      expect(decoded, equals(''));
    });

    test('encodes special characters', () {
      final result = PasswordEncoder.encode('p@ss\$w0rd!#%');
      final decoded = utf8.decode(base64Decode(result.substring(4)));
      expect(decoded, equals('p@ss\$w0rd!#%'));
    });

    test('encodes unicode characters', () {
      final result = PasswordEncoder.encode('пароль');
      final decoded = utf8.decode(base64Decode(result.substring(4)));
      expect(decoded, equals('пароль'));
    });
  });
}
