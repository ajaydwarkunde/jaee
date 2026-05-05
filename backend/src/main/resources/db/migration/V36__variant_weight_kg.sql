ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10, 3);
