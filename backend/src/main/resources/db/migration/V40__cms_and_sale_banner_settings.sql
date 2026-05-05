INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'homepage_hero_candles_image_url', '', 'STRING', 'Homepage hero — candles side background image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'homepage_hero_candles_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'homepage_hero_hampers_image_url', '', 'STRING', 'Homepage hero — hampers side background image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'homepage_hero_hampers_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'homepage_story_image_url', '', 'STRING', 'Homepage Our Story section image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'homepage_story_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'shop_candles_header_image_url', '', 'STRING', 'Candles shop (/shop/candles) header background image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'shop_candles_header_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'shop_candles_header_title', '', 'STRING', 'Optional title override for Candles shop header (leave blank to use category name)'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'shop_candles_header_title');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'sale_page_header_image_url', '', 'STRING', 'Sale page hero background image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'sale_page_header_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'sale_page_header_title', '', 'STRING', 'Sale page hero title (optional)'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'sale_page_header_title');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'sale_page_header_subtitle', '', 'STRING', 'Sale page hero subtitle (optional)'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'sale_page_header_subtitle');
