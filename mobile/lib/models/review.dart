class Review {
  final int id;
  final int productId;
  final int userId;
  final String? userName;
  final int rating;
  final String? title;
  final String? comment;
  final bool verifiedPurchase;
  final int helpfulCount;
  final String createdAt;

  const Review({
    required this.id,
    required this.productId,
    required this.userId,
    this.userName,
    required this.rating,
    this.title,
    this.comment,
    required this.verifiedPurchase,
    required this.helpfulCount,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as int,
      productId: json['productId'] as int? ?? 0,
      userId: json['userId'] as int? ?? 0,
      userName: json['userName'] as String?,
      rating: json['rating'] as int,
      title: json['title'] as String?,
      comment: json['comment'] as String?,
      verifiedPurchase: json['verifiedPurchase'] as bool? ?? false,
      helpfulCount: json['helpfulCount'] as int? ?? 0,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class ReviewSummary {
  final double averageRating;
  final int totalReviews;
  final Map<int, int> ratingDistribution;

  const ReviewSummary({
    required this.averageRating,
    required this.totalReviews,
    required this.ratingDistribution,
  });

  factory ReviewSummary.fromJson(Map<String, dynamic> json) {
    final dist = json['ratingDistribution'] as Map<String, dynamic>? ?? {};
    return ReviewSummary(
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0,
      totalReviews: json['totalReviews'] as int? ?? 0,
      ratingDistribution: dist.map((k, v) => MapEntry(int.parse(k), v as int)),
    );
  }
}
