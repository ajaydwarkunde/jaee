ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE product_variants pv
SET sort_order = x.ord
FROM (
    SELECT id,
           (ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY id) - 1)::INTEGER AS ord
    FROM product_variants
) x
WHERE pv.id = x.id;
