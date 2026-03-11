import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTypography {
  AppTypography._();

  static const String _serifFamily = 'CormorantGaramond';
  static const String _sansFamily = 'DMSans';

  // Headings (Cormorant Garamond)
  static const TextStyle h1 = TextStyle(
    fontFamily: _serifFamily,
    fontSize: 48,
    fontWeight: FontWeight.w700,
    color: AppColors.charcoal,
    height: 1.0,
  );

  static const TextStyle h2 = TextStyle(
    fontFamily: _serifFamily,
    fontSize: 40,
    fontWeight: FontWeight.w700,
    color: AppColors.charcoal,
    height: 1.0,
  );

  static const TextStyle h3 = TextStyle(
    fontFamily: _serifFamily,
    fontSize: 32,
    fontWeight: FontWeight.w600,
    color: AppColors.charcoal,
    height: 1.125,
  );

  static const TextStyle h4 = TextStyle(
    fontFamily: _serifFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: AppColors.charcoal,
    height: 1.33,
  );

  static const TextStyle h5 = TextStyle(
    fontFamily: _serifFamily,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.charcoal,
    height: 1.4,
  );

  // Body (DM Sans)
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 18,
    fontWeight: FontWeight.w400,
    color: AppColors.charcoal,
    height: 1.56,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.charcoal,
    height: 1.5,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.charcoal,
    height: 1.43,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.warmGray,
    height: 1.33,
  );

  // Labels
  static const TextStyle labelLarge = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.charcoal,
    height: 1.5,
  );

  static const TextStyle labelMedium = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.charcoal,
    height: 1.43,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.warmGray,
    height: 1.33,
  );

  // Button text
  static const TextStyle button = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.softWhite,
    height: 1.5,
    letterSpacing: 0.5,
  );

  // Price text
  static const TextStyle price = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.charcoal,
    height: 1.56,
  );

  static const TextStyle priceStrikethrough = TextStyle(
    fontFamily: _sansFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.warmGray,
    height: 1.43,
    decoration: TextDecoration.lineThrough,
  );
}
