ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sheet_sku VARCHAR(100),
    ADD COLUMN IF NOT EXISTS sheet_last_synced_at TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS ux_products_sheet_sku
    ON products (UPPER(sheet_sku))
    WHERE sheet_sku IS NOT NULL;
