class BuilderOption {
  final int id;
  final String builderType;
  final String optionType;
  final String optionKey;
  final String label;
  final double? basePrice;
  final double? surcharge;
  final bool active;
  final int displayOrder;

  const BuilderOption({
    required this.id,
    required this.builderType,
    required this.optionType,
    required this.optionKey,
    required this.label,
    this.basePrice,
    this.surcharge,
    required this.active,
    required this.displayOrder,
  });

  factory BuilderOption.fromJson(Map<String, dynamic> json) {
    return BuilderOption(
      id: json['id'] as int,
      builderType: json['builderType'] as String,
      optionType: json['optionType'] as String,
      optionKey: json['optionKey'] as String? ?? '',
      label: json['label'] as String,
      basePrice: (json['basePrice'] as num?)?.toDouble(),
      surcharge: (json['surcharge'] as num?)?.toDouble(),
      active: json['active'] as bool? ?? true,
      displayOrder: json['displayOrder'] as int? ?? 0,
    );
  }
}
