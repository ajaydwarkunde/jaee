import 'product.dart';

class WishlistItem {
  final int id;
  final Product product;

  const WishlistItem({required this.id, required this.product});

  factory WishlistItem.fromJson(Map<String, dynamic> json) {
    return WishlistItem(
      id: json['id'] as int,
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
    );
  }
}
