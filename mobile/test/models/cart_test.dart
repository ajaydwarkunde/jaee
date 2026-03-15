import 'package:flutter_test/flutter_test.dart';
import 'package:jaee/models/cart.dart';

void main() {
  group('CartItem', () {
    test('fromJson creates cart item correctly', () {
      final json = {
        'id': 1,
        'productId': 10,
        'productName': 'Candle',
        'productSlug': 'candle',
        'productImage': 'https://example.com/img.jpg',
        'unitPrice': 499.0,
        'qty': 2,
        'subtotal': 998.0,
        'inStock': true,
        'availableQty': 10,
      };

      final item = CartItem.fromJson(json);

      expect(item.id, equals(1));
      expect(item.productId, equals(10));
      expect(item.productName, equals('Candle'));
      expect(item.unitPrice, equals(499.0));
      expect(item.qty, equals(2));
      expect(item.subtotal, equals(998.0));
      expect(item.inStock, isTrue);
      expect(item.availableQty, equals(10));
    });
  });

  group('Cart', () {
    test('fromJson creates cart with items', () {
      final json = {
        'id': 1,
        'items': [
          {
            'id': 1,
            'productId': 10,
            'productName': 'Product A',
            'unitPrice': 500.0,
            'qty': 2,
            'subtotal': 1000.0,
          },
        ],
        'subtotal': 1000.0,
        'itemCount': 2,
      };

      final cart = Cart.fromJson(json);

      expect(cart.id, equals(1));
      expect(cart.items, hasLength(1));
      expect(cart.subtotal, equals(1000.0));
      expect(cart.itemCount, equals(2));
    });

    test('fromJson handles null items', () {
      final json = {'id': 1};
      final cart = Cart.fromJson(json);

      expect(cart.items, isEmpty);
      expect(cart.subtotal, equals(0.0));
      expect(cart.itemCount, equals(0));
    });
  });

  group('GuestCartItem', () {
    test('creates with required fields', () {
      const item = GuestCartItem(productId: 1, qty: 3);
      expect(item.productId, equals(1));
      expect(item.qty, equals(3));
    });

    test('toJson produces correct map', () {
      const item = GuestCartItem(productId: 5, qty: 2);
      final json = item.toJson();

      expect(json, equals({'productId': 5, 'qty': 2}));
    });

    test('fromJson round-trips correctly', () {
      const original = GuestCartItem(productId: 5, qty: 2);
      final restored = GuestCartItem.fromJson(original.toJson());

      expect(restored.productId, equals(5));
      expect(restored.qty, equals(2));
    });

    test('copyWith creates modified copy', () {
      const item = GuestCartItem(productId: 1, qty: 2);
      final updated = item.copyWith(qty: 5);

      expect(updated.productId, equals(1));
      expect(updated.qty, equals(5));
    });
  });
}
