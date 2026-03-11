class OrderItem {
  final int id;
  final int? productId;
  final String name;
  final double price;
  final int qty;
  final double subtotal;
  final String? imageUrl;

  const OrderItem({
    required this.id,
    this.productId,
    required this.name,
    required this.price,
    required this.qty,
    required this.subtotal,
    this.imageUrl,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as int,
      productId: json['productId'] as int?,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      qty: json['qty'] as int,
      subtotal: (json['subtotal'] as num).toDouble(),
      imageUrl: json['imageUrl'] as String?,
    );
  }
}

class Order {
  final int id;
  final String status;
  final double totalAmount;
  final String currency;
  final List<OrderItem> items;
  final String? shippingAddress;
  final String? customerEmail;
  final String? customerPhone;
  final String createdAt;
  final String? paidAt;
  final String? trackingNumber;
  final String? trackingUrl;
  final String? carrier;
  final int? userId;
  final String? userName;
  final int? itemCount;

  const Order({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.currency,
    required this.items,
    this.shippingAddress,
    this.customerEmail,
    this.customerPhone,
    required this.createdAt,
    this.paidAt,
    this.trackingNumber,
    this.trackingUrl,
    this.carrier,
    this.userId,
    this.userName,
    this.itemCount,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as int,
      status: json['status'] as String,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'INR',
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      shippingAddress: json['shippingAddress'] as String?,
      customerEmail: json['customerEmail'] as String?,
      customerPhone: json['customerPhone'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
      paidAt: json['paidAt'] as String?,
      trackingNumber: json['trackingNumber'] as String?,
      trackingUrl: json['trackingUrl'] as String?,
      carrier: json['carrier'] as String?,
      userId: json['userId'] as int?,
      userName: json['userName'] as String?,
      itemCount: json['itemCount'] as int?,
    );
  }
}
