import 'package:flutter_test/flutter_test.dart';
import 'package:jaee/models/product.dart';

void main() {
  group('Product', () {
    final sampleJson = {
      'id': 1,
      'name': 'Test Candle',
      'slug': 'test-candle',
      'description': 'A beautiful candle',
      'price': 499.0,
      'compareAtPrice': 699.0,
      'discountPercent': 29,
      'currency': 'INR',
      'categoryId': 1,
      'categoryName': 'Candles',
      'images': ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      'stockQty': 10,
      'active': true,
      'inStock': true,
      'createdAt': '2024-01-15T00:00:00',
      'avgRating': 4.5,
      'reviewCount': 12,
    };

    test('fromJson creates product correctly', () {
      final product = Product.fromJson(sampleJson);

      expect(product.id, equals(1));
      expect(product.name, equals('Test Candle'));
      expect(product.slug, equals('test-candle'));
      expect(product.description, equals('A beautiful candle'));
      expect(product.price, equals(499.0));
      expect(product.compareAtPrice, equals(699.0));
      expect(product.currency, equals('INR'));
      expect(product.images, hasLength(2));
      expect(product.stockQty, equals(10));
      expect(product.active, isTrue);
      expect(product.avgRating, equals(4.5));
      expect(product.reviewCount, equals(12));
    });

    test('fromJson handles null optional fields', () {
      final minimalJson = {
        'id': 1,
        'name': 'Minimal',
        'slug': 'minimal',
        'price': 100,
      };

      final product = Product.fromJson(minimalJson);

      expect(product.description, isNull);
      expect(product.compareAtPrice, isNull);
      expect(product.images, isEmpty);
      expect(product.currency, equals('INR'));
      expect(product.stockQty, equals(0));
      expect(product.active, isTrue);
    });

    test('toJson produces correct map', () {
      final product = Product.fromJson(sampleJson);
      final json = product.toJson();

      expect(json['id'], equals(1));
      expect(json['name'], equals('Test Candle'));
      expect(json['price'], equals(499.0));
      expect(json['images'], hasLength(2));
    });

    test('primaryImage returns first image', () {
      final product = Product.fromJson(sampleJson);
      expect(product.primaryImage, equals('https://example.com/img1.jpg'));
    });

    test('primaryImage returns empty for no images', () {
      final product = Product.fromJson({
        'id': 1,
        'name': 'No Image',
        'slug': 'no-image',
        'price': 100,
        'images': <String>[],
      });
      expect(product.primaryImage, equals(''));
    });

    test('isOnSale returns true when compareAtPrice > price', () {
      final product = Product.fromJson(sampleJson);
      expect(product.isOnSale, isTrue);
    });

    test('isOnSale returns false when no compareAtPrice', () {
      final product = Product.fromJson({
        'id': 1,
        'name': 'No Sale',
        'slug': 'no-sale',
        'price': 100,
      });
      expect(product.isOnSale, isFalse);
    });
  });
}
