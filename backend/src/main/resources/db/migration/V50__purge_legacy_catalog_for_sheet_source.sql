-- The Google Sheet is now the sole catalog source. Remove every legacy storefront
-- product (seed data, manual admin entries, and pre-sheet imports). Order history
-- keeps name/price snapshots; order_items.product_id is set NULL on delete.
DELETE FROM products;
