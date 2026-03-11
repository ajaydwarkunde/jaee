class CouponValidation {
  final bool valid;
  final String? message;
  final double? discountAmount;
  final String? discountType;
  final double? discountValue;

  const CouponValidation({
    required this.valid,
    this.message,
    this.discountAmount,
    this.discountType,
    this.discountValue,
  });

  factory CouponValidation.fromJson(Map<String, dynamic> json) {
    return CouponValidation(
      valid: json['valid'] as bool? ?? false,
      message: json['message'] as String?,
      discountAmount: (json['discountAmount'] as num?)?.toDouble(),
      discountType: json['discountType'] as String?,
      discountValue: (json['discountValue'] as num?)?.toDouble(),
    );
  }
}
