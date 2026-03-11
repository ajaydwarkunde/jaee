class User {
  final int id;
  final String? name;
  final String? email;
  final String? mobileNumber;
  final String role;
  final bool? twoFactorEnabled;

  const User({
    required this.id,
    this.name,
    this.email,
    this.mobileNumber,
    required this.role,
    this.twoFactorEnabled,
  });

  bool get isAdmin => role == 'ADMIN';

  User copyWith({
    int? id,
    String? name,
    String? email,
    String? mobileNumber,
    String? role,
    bool? twoFactorEnabled,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      mobileNumber: mobileNumber ?? this.mobileNumber,
      role: role ?? this.role,
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
    );
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: json['name'] as String?,
      email: json['email'] as String?,
      mobileNumber: json['mobileNumber'] as String?,
      role: json['role'] as String? ?? 'USER',
      twoFactorEnabled: json['twoFactorEnabled'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'mobileNumber': mobileNumber,
      'role': role,
      'twoFactorEnabled': twoFactorEnabled,
    };
  }
}
