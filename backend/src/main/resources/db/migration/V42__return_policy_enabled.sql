INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT 'return_policy_enabled', 'true', 'BOOLEAN', 'Show return policy in product trust badges'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'return_policy_enabled');
