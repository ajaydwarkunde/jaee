class Product {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double? compareAtPrice;
  final int? discountPercent;
  final String currency;
  final int? categoryId;
  final String? categoryName;
  final List<String> images;
  final int stockQty;
  final bool active;
  final bool inStock;
  final String createdAt;
  final double? avgRating;
  final int? reviewCount;

  const Product({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.compareAtPrice,
    this.discountPercent,
    required this.currency,
    this.categoryId,
    this.categoryName,
    required this.images,
    required this.stockQty,
    required this.active,
    required this.inStock,
    required this.createdAt,
    this.avgRating,
    this.reviewCount,
  });

  String get primaryImage => images.isNotEmpty ? images.first : '';
  bool get isOnSale => compareAtPrice != null && compareAtPrice! > price;

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as int,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      compareAtPrice: (json['compareAtPrice'] as num?)?.toDouble(),
      discountPercent: json['discountPercent'] as int?,
      currency: json['currency'] as String? ?? 'INR',
      categoryId: json['categoryId'] as int?,
      categoryName: json['categoryName'] as String?,
      images: (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      stockQty: json['stockQty'] as int? ?? 0,
      active: json['active'] as bool? ?? true,
      inStock: json['inStock'] as bool? ?? true,
      createdAt: json['createdAt'] as String? ?? '',
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'price': price,
      'compareAtPrice': compareAtPrice,
      'discountPercent': discountPercent,
      'currency': currency,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'images': images,
      'stockQty': stockQty,
      'active': active,
      'inStock': inStock,
      'createdAt': createdAt,
      'avgRating': avgRating,
      'reviewCount': reviewCount,
    };
  }
}
