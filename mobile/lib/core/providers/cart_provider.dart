import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/cart.dart';
import 'auth_provider.dart';

class GuestCartNotifier extends StateNotifier<List<GuestCartItem>> {
  final SharedPreferences _prefs;
  static const _key = 'jaee_guest_cart';

  GuestCartNotifier(this._prefs) : super([]) {
    _load();
  }

  void _load() {
    final json = _prefs.getString(_key);
    if (json != null) {
      final list = jsonDecode(json) as List<dynamic>;
      state = list
          .map((e) => GuestCartItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }
  }

  void _save() {
    _prefs.setString(_key, jsonEncode(state.map((e) => e.toJson()).toList()));
  }

  void addToCart(int productId, int qty) {
    final idx = state.indexWhere((item) => item.productId == productId);
    if (idx >= 0) {
      state = [
        for (int i = 0; i < state.length; i++)
          if (i == idx)
            state[i].copyWith(qty: state[i].qty + qty)
          else
            state[i],
      ];
    } else {
      state = [...state, GuestCartItem(productId: productId, qty: qty)];
    }
    _save();
  }

  void updateItem(int productId, int qty) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    state = [
      for (final item in state)
        if (item.productId == productId) item.copyWith(qty: qty) else item,
    ];
    _save();
  }

  void removeItem(int productId) {
    state = state.where((item) => item.productId != productId).toList();
    _save();
  }

  void clear() {
    state = [];
    _save();
  }

  int get totalCount => state.fold(0, (sum, item) => sum + item.qty);
}

final guestCartProvider =
    StateNotifierProvider<GuestCartNotifier, List<GuestCartItem>>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return GuestCartNotifier(prefs);
});
