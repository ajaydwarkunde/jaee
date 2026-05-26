-- Product customization field (optional per product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS customization_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS customization_text TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS customization_text TEXT;
