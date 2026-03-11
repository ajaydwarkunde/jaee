class Address {
  final int id;
  final String line1;
  final String? line2;
  final String city;
  final String? state;
  final String country;
  final String? zip;
  final String? phone;
  final bool isDefault;

  const Address({
    required this.id,
    required this.line1,
    this.line2,
    required this.city,
    this.state,
    required this.country,
    this.zip,
    this.phone,
    required this.isDefault,
  });

  String get fullAddress {
    final parts = [line1];
    if (line2 != null && line2!.isNotEmpty) parts.add(line2!);
    parts.add(city);
    if (state != null && state!.isNotEmpty) parts.add(state!);
    parts.add(country);
    if (zip != null && zip!.isNotEmpty) parts.add(zip!);
    return parts.join(', ');
  }

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'] as int,
      line1: json['line1'] as String,
      line2: json['line2'] as String?,
      city: json['city'] as String,
      state: json['state'] as String?,
      country: json['country'] as String? ?? 'India',
      zip: json['zip'] as String?,
      phone: json['phone'] as String?,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'line1': line1,
    'line2': line2,
    'city': city,
    'state': state,
    'country': country,
    'zip': zip,
    'phone': phone,
    'isDefault': isDefault,
  };
}
