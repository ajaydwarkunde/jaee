-- Add expense (cost) column to product_variants for profit tracking
ALTER TABLE product_variants ADD COLUMN expense DECIMAL(10,2);

-- Snapshot the per-unit expense at checkout time on order_items
ALTER TABLE order_items ADD COLUMN expense_snapshot DECIMAL(10,2);
