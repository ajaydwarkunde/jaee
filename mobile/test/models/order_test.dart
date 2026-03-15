import 'package:flutter_test/flutter_test.dart';
import 'package:jaee/models/order.dart';

void main() {
  group('OrderItem', () {
    test('fromJson creates order item correctly', () {
      final json = {
        'id': 1,
        'productId': 10,
        'name': 'Test Product',
        'price': 499.0,
        'qty': 2,
        'subtotal': 998.0,
        'imageUrl': 'https://example.com/img.jpg',
      };

      final item = OrderItem.fromJson(json);

      expect(item.id, equals(1));
      expect(item.productId, equals(10));
      expect(item.name, equals('Test Product'));
      expect(item.price, equals(499.0));
      expect(item.qty, equals(2));
      expect(item.subtotal, equals(998.0));
      expect(item.imageUrl, equals('https://example.com/img.jpg'));
    });
  });

  group('Order', () {
    final sampleJson = {
      'id': 1,
      'status': 'PAID',
      'totalAmount': 1998.0,
      'currency': 'INR',
      'items': [
        {
          'id': 1,
          'productId': 10,
          'name': 'Product A',
          'price': 499.0,
          'qty': 2,
          'subtotal': 998.0,
        },
        {
          'id': 2,
          'productId': 11,
          'name': 'Product B',
          'price': 1000.0,
          'qty': 1,
          'subtotal': 1000.0,
        },
      ],
      'shippingAddress': '123 Main St',
      'customerEmail': 'test@example.com',
      'createdAt': '2024-01-15T10:30:00',
      'paidAt': '2024-01-15T10:35:00',
    };

    test('fromJson creates order with items', () {
      final order = Order.fromJson(sampleJson);

      expect(order.id, equals(1));
      expect(order.status, equals('PAID'));
      expect(order.totalAmount, equals(1998.0));
      expect(order.currency, equals('INR'));
      expect(order.items, hasLength(2));
      expect(order.shippingAddress, equals('123 Main St'));
      expect(order.customerEmail, equals('test@example.com'));
    });

    test('fromJson handles empty items', () {
      final json = {
        'id': 2,
        'status': 'PENDING',
        'totalAmount': 0.0,
      };

      final order = Order.fromJson(json);

      expect(order.items, isEmpty);
      expect(order.currency, equals('INR'));
      expect(order.shippingAddress, isNull);
    });
  });
}
