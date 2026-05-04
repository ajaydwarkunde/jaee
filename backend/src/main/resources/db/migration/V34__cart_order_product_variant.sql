ALTER TABLE cart_items
    ADD COLUMN IF NOT EXISTS variant_id BIGINT REFERENCES product_variants (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS variant_label VARCHAR(500);

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS variant_id BIGINT REFERENCES product_variants (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS variant_label VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON cart_items (variant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items (variant_id);
