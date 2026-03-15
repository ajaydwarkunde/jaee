import 'package:flutter_test/flutter_test.dart';
import 'package:jaee/core/utils/formatters.dart';

void main() {
  group('Formatters.formatPrice', () {
    test('formats whole number without decimals', () {
      final result = Formatters.formatPrice(999);
      expect(result, contains('999'));
      expect(result, contains('₹'));
    });

    test('formats decimal price with two decimal places', () {
      final result = Formatters.formatPrice(49.99);
      expect(result, contains('49.99'));
    });

    test('formats zero', () {
      final result = Formatters.formatPrice(0);
      expect(result, contains('0'));
    });

    test('formats large numbers with Indian grouping', () {
      final result = Formatters.formatPrice(100000);
      expect(result, contains('1,00,000'));
    });
  });

  group('Formatters.formatDate', () {
    test('formats ISO date string', () {
      final result = Formatters.formatDate('2024-01-15T10:30:00');
      expect(result, equals('15 Jan 2024'));
    });

    test('formats date without time component', () {
      final result = Formatters.formatDate('2024-12-25T00:00:00');
      expect(result, equals('25 Dec 2024'));
    });
  });

  group('Formatters.formatDateTime', () {
    test('formats ISO date with time', () {
      final result = Formatters.formatDateTime('2024-01-15T14:30:00');
      expect(result, contains('15 Jan 2024'));
      expect(result, contains('02:30'));
    });
  });

  group('Formatters.timeAgo', () {
    test('returns just now for very recent dates', () {
      final now = DateTime.now().toIso8601String();
      expect(Formatters.timeAgo(now), equals('just now'));
    });

    test('returns minutes ago', () {
      final tenMinAgo =
          DateTime.now().subtract(const Duration(minutes: 10)).toIso8601String();
      expect(Formatters.timeAgo(tenMinAgo), equals('10m ago'));
    });

    test('returns hours ago', () {
      final threeHoursAgo =
          DateTime.now().subtract(const Duration(hours: 3)).toIso8601String();
      expect(Formatters.timeAgo(threeHoursAgo), equals('3h ago'));
    });

    test('returns days ago', () {
      final fiveDaysAgo =
          DateTime.now().subtract(const Duration(days: 5)).toIso8601String();
      expect(Formatters.timeAgo(fiveDaysAgo), equals('5d ago'));
    });

    test('returns months ago', () {
      final threeMonthsAgo =
          DateTime.now().subtract(const Duration(days: 90)).toIso8601String();
      expect(Formatters.timeAgo(threeMonthsAgo), equals('3mo ago'));
    });

    test('returns years ago', () {
      final twoYearsAgo =
          DateTime.now().subtract(const Duration(days: 730)).toIso8601String();
      expect(Formatters.timeAgo(twoYearsAgo), equals('2y ago'));
    });
  });

  group('Formatters.calculateDiscountPercent', () {
    test('calculates percentage correctly', () {
      expect(Formatters.calculateDiscountPercent(80, 100), equals(20));
    });

    test('returns 0 when compareAtPrice is 0', () {
      expect(Formatters.calculateDiscountPercent(80, 0), equals(0));
    });

    test('returns 0 when compareAtPrice is less than price', () {
      expect(Formatters.calculateDiscountPercent(100, 80), equals(0));
    });

    test('returns 0 when prices are equal', () {
      expect(Formatters.calculateDiscountPercent(100, 100), equals(0));
    });

    test('rounds correctly', () {
      expect(Formatters.calculateDiscountPercent(70, 100), equals(30));
      expect(Formatters.calculateDiscountPercent(33, 100), equals(67));
    });
  });
}
