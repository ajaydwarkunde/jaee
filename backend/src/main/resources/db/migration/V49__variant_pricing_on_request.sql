ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS pricing_on_request BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS ux_product_variants_sku
    ON product_variants (UPPER(sku))
    WHERE sku IS NOT NULL;
