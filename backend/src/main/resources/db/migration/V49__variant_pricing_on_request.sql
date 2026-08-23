ALTER TABLE product_variants
    ADD COLUMN IF NOT EXISTS pricing_on_request BOOLEAN NOT NULL DEFAULT FALSE;

-- product_variants.sku has been nullable and non-unique since V27, so historic rows
-- can share a SKU. Keep the canonical variant per SKU and park the rest under a
-- suffixed, inactive SKU: nothing is deleted, orders keep their sku_snapshot, and the
-- parked rows drop out of the storefront selector until an admin reviews them.
WITH ranked AS (
    SELECT v.id,
           ROW_NUMBER() OVER (
               PARTITION BY UPPER(v.sku)
               ORDER BY
                   CASE WHEN COALESCE(v.active, TRUE) THEN 0 ELSE 1 END,
                   CASE WHEN UPPER(COALESCE(p.sheet_sku, '')) = UPPER(v.sku) THEN 0 ELSE 1 END,
                   v.id
           ) AS rn
    FROM product_variants v
    LEFT JOIN products p ON p.id = v.product_id
    WHERE v.sku IS NOT NULL
)
UPDATE product_variants pv
SET sku = LEFT(pv.sku, 80) || '-DUP' || pv.id,
    active = FALSE
FROM ranked
WHERE ranked.id = pv.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_product_variants_sku
    ON product_variants (UPPER(sku))
    WHERE sku IS NOT NULL;
