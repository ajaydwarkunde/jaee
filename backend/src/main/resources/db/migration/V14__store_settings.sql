-- Store settings table for admin-configurable values
CREATE TABLE store_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) NOT NULL DEFAULT 'STRING',
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO store_settings (setting_key, setting_value, setting_type, description) VALUES
    ('free_shipping_enabled', 'true', 'BOOLEAN', 'Enable or disable free shipping'),
    ('free_shipping_threshold', '999', 'NUMBER', 'Minimum order amount for free shipping (in INR)'),
    ('return_days', '7', 'NUMBER', 'Number of days allowed for returns'),
    ('return_policy_text', '7 Days Easy Returns', 'STRING', 'Return policy display text'),
    ('cod_enabled', 'false', 'BOOLEAN', 'Enable Cash on Delivery'),
    ('cod_charges', '50', 'NUMBER', 'COD extra charges (in INR)'),
    ('shipping_charges', '99', 'NUMBER', 'Standard shipping charges when free shipping not applicable'),
    ('estimated_delivery_days', '5-7', 'STRING', 'Estimated delivery time text'),
    ('support_email', 'jaaistore1212@gmail.com', 'STRING', 'Support email address'),
    ('support_phone', '', 'STRING', 'Support phone number'),
    ('instagram_handle', '@jaai_candle_studio', 'STRING', 'Instagram handle'),
    ('announcement_text', '', 'STRING', 'Top banner announcement text'),
    ('announcement_enabled', 'false', 'BOOLEAN', 'Show announcement banner');

-- Create index for faster lookups
CREATE INDEX idx_store_settings_key ON store_settings(setting_key);
