class AppConfig {
  static const String appName = 'Jaee';
  
  static String get apiBaseUrl {
    return const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://10.0.2.2:8080',
    );
  }

  static const String razorpayKeyId = String.fromEnvironment(
    'RAZORPAY_KEY_ID',
    defaultValue: '',
  );

  static const Duration accessTokenExpiry = Duration(hours: 1);
  static const Duration refreshTokenExpiry = Duration(days: 7);
  
  static const int defaultPageSize = 12;
  static const int featuredProductsLimit = 8;
}
