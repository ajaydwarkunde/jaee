ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS sku_snapshot VARCHAR(120),
    ADD COLUMN IF NOT EXISTS compare_at_price_snapshot DECIMAL(10, 2);
