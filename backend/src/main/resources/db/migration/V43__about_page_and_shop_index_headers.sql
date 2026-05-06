-- About page CMS & Shop index (/shop) header
INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'about_page_header_image_url', '', 'STRING', 'About page hero background image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'about_page_header_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'about_page_header_title', '', 'STRING', 'About page hero title (leave blank for default)'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'about_page_header_title');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'about_story_image_url', '', 'STRING', 'About page — square/story image beside Our Story'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'about_story_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'about_process_image_url', '', 'STRING', 'About page — Our Process section image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'about_process_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'shop_index_header_image_url', '', 'STRING', 'Shop index (/shop all products) header background image URL'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'shop_index_header_image_url');

INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'shop_index_header_title', '', 'STRING', 'Shop index header title override (leave blank for All Products)'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'shop_index_header_title');
