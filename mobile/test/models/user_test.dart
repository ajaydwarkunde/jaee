import 'package:flutter_test/flutter_test.dart';
import 'package:jaee/models/user.dart';

void main() {
  group('User', () {
    final sampleJson = {
      'id': 1,
      'name': 'Test User',
      'email': 'test@example.com',
      'mobileNumber': '+919876543210',
      'role': 'USER',
      'twoFactorEnabled': false,
    };

    test('fromJson creates user correctly', () {
      final user = User.fromJson(sampleJson);

      expect(user.id, equals(1));
      expect(user.name, equals('Test User'));
      expect(user.email, equals('test@example.com'));
      expect(user.mobileNumber, equals('+919876543210'));
      expect(user.role, equals('USER'));
      expect(user.twoFactorEnabled, isFalse);
    });

    test('fromJson handles null optional fields', () {
      final minimalJson = {'id': 1};
      final user = User.fromJson(minimalJson);

      expect(user.name, isNull);
      expect(user.email, isNull);
      expect(user.mobileNumber, isNull);
      expect(user.role, equals('USER'));
    });

    test('toJson produces correct map', () {
      final user = User.fromJson(sampleJson);
      final json = user.toJson();

      expect(json['id'], equals(1));
      expect(json['name'], equals('Test User'));
      expect(json['email'], equals('test@example.com'));
      expect(json['role'], equals('USER'));
    });

    test('isAdmin returns true for ADMIN role', () {
      final admin = User.fromJson({...sampleJson, 'role': 'ADMIN'});
      expect(admin.isAdmin, isTrue);
    });

    test('isAdmin returns false for USER role', () {
      final user = User.fromJson(sampleJson);
      expect(user.isAdmin, isFalse);
    });

    test('copyWith creates modified copy', () {
      final user = User.fromJson(sampleJson);
      final updated = user.copyWith(name: 'New Name', role: 'ADMIN');

      expect(updated.name, equals('New Name'));
      expect(updated.role, equals('ADMIN'));
      expect(updated.email, equals('test@example.com'));
      expect(updated.id, equals(1));
    });

    test('copyWith preserves original when no changes', () {
      final user = User.fromJson(sampleJson);
      final copy = user.copyWith();

      expect(copy.id, equals(user.id));
      expect(copy.name, equals(user.name));
      expect(copy.email, equals(user.email));
      expect(copy.role, equals(user.role));
    });
  });
}
