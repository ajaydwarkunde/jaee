import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final _currencyFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static final _currencyFormatWithDecimals = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  static String formatPrice(double price) {
    if (price == price.roundToDouble()) {
      return _currencyFormat.format(price);
    }
    return _currencyFormatWithDecimals.format(price);
  }

  static String formatDate(String isoDate) {
    final date = DateTime.parse(isoDate);
    return DateFormat('dd MMM yyyy').format(date);
  }

  static String formatDateTime(String isoDate) {
    final date = DateTime.parse(isoDate);
    return DateFormat('dd MMM yyyy, hh:mm a').format(date);
  }

  static String timeAgo(String isoDate) {
    final date = DateTime.parse(isoDate);
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays > 365) return '${diff.inDays ~/ 365}y ago';
    if (diff.inDays > 30) return '${diff.inDays ~/ 30}mo ago';
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
    return 'just now';
  }

  static int calculateDiscountPercent(double price, double compareAtPrice) {
    if (compareAtPrice <= 0 || compareAtPrice <= price) return 0;
    return ((1 - price / compareAtPrice) * 100).round();
  }
}
