-- Admin-only custom status label (optional overlay on workflow status)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS custom_status VARCHAR(255);

-- Append-only style internal notes (stored as plain text with timestamps)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Per-unit weight captured at checkout for admin breakdown / shipping reference
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS weight_kg_snapshot DECIMAL(10, 3);
