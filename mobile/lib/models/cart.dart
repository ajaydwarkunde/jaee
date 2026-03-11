class CartItem {
  final int id;
  final int productId;
  final String productName;
  final String productSlug;
  final String? productImage;
  final double unitPrice;
  final int qty;
  final double subtotal;
  final bool inStock;
  final int availableQty;

  const CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productSlug,
    this.productImage,
    required this.unitPrice,
    required this.qty,
    required this.subtotal,
    required this.inStock,
    required this.availableQty,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] as int,
      productId: json['productId'] as int,
      productName: json['productName'] as String,
      productSlug: json['productSlug'] as String? ?? '',
      productImage: json['productImage'] as String?,
      unitPrice: (json['unitPrice'] as num).toDouble(),
      qty: json['qty'] as int,
      subtotal: (json['subtotal'] as num).toDouble(),
      inStock: json['inStock'] as bool? ?? true,
      availableQty: json['availableQty'] as int? ?? 0,
    );
  }
}

class Cart {
  final int id;
  final List<CartItem> items;
  final double subtotal;
  final int itemCount;

  const Cart({
    required this.id,
    required this.items,
    required this.subtotal,
    required this.itemCount,
  });

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: json['id'] as int,
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => CartItem.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
      itemCount: json['itemCount'] as int? ?? 0,
    );
  }
}

class GuestCartItem {
  final int productId;
  final int qty;

  const GuestCartItem({required this.productId, required this.qty});

  GuestCartItem copyWith({int? productId, int? qty}) {
    return GuestCartItem(
      productId: productId ?? this.productId,
      qty: qty ?? this.qty,
    );
  }

  Map<String, dynamic> toJson() => {'productId': productId, 'qty': qty};

  factory GuestCartItem.fromJson(Map<String, dynamic> json) {
    return GuestCartItem(
      productId: json['productId'] as int,
      qty: json['qty'] as int,
    );
  }
}
