-- WhatsApp-only number (wa.me); not intended for display on the storefront.
INSERT INTO store_settings (setting_key, setting_value, setting_type, description)
SELECT
    'whatsapp_phone',
    '919404380308',
    'STRING',
    'Digits only with country code (e.g. 919404380308). Used only for WhatsApp chat links — not shown on the public site.'
WHERE NOT EXISTS (SELECT 1 FROM store_settings WHERE setting_key = 'whatsapp_phone');
