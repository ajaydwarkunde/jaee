-- Promotional code shown on the storefront announcement bar
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until, active)
VALUES (
    'JAAI10',
    '10% off your first order',
    'PERCENTAGE',
    10,
    0,
    200,
    NULL,
    TIMESTAMP '2026-12-31 23:59:59',
    true
)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE products ADD COLUMN IF NOT EXISTS base_cost DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8, 3) NOT NULL DEFAULT 0.5;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zone VARCHAR(20);
