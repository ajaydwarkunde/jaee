-- Backfill expense_snapshot on existing order_items from the current variant expense.
-- This only fills rows where variant_id is set and the variant has an expense value.
UPDATE order_items oi
SET expense_snapshot = pv.expense
FROM product_variants pv
WHERE oi.variant_id = pv.id
  AND pv.expense IS NOT NULL
  AND oi.expense_snapshot IS NULL;
