import 'dart:convert';

class PasswordEncoder {
  PasswordEncoder._();

  static const String _encodingPrefix = 'enc:';

  static String encode(String password) {
    final encoded = base64Encode(utf8.encode(password));
    return '$_encodingPrefix$encoded';
  }
}
