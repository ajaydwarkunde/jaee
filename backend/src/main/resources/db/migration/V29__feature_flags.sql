-- Public storefront feature toggles (admin-controlled). Default off until ready.
INSERT INTO store_settings (setting_key, setting_value, setting_type, description) VALUES
    ('feature_hamper_public', 'false', 'BOOLEAN', 'Show hamper store (nav, hero, gift sets, custom hamper) on the public site'),
    ('feature_custom_candle', 'false', 'BOOLEAN', 'Show custom candle builder links and CTAs'),
    ('feature_two_stores_section', 'false', 'BOOLEAN', 'Show the “Two Stores, One Destination” section on the homepage')
ON CONFLICT (setting_key) DO NOTHING;
