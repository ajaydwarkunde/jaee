-- Coupons table
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE or FIXED
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2), -- Max discount for percentage coupons
    usage_limit INTEGER, -- NULL means unlimited
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track which users have used which coupons
CREATE TABLE coupon_usages (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    order_id BIGINT REFERENCES orders(id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(coupon_id, user_id) -- Each user can use a coupon only once
);

-- Add coupon reference to orders
ALTER TABLE orders ADD COLUMN coupon_id BIGINT REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50);

-- Create indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(user_id);

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until)
VALUES 
    ('WELCOME10', 'Welcome discount - 10% off', 'PERCENTAGE', 10, 500, 200, NULL, '2026-12-31 23:59:59'),
    ('FLAT100', 'Flat ₹100 off on orders above ₹999', 'FIXED', 100, 999, NULL, 100, '2026-12-31 23:59:59'),
    ('SUMMER20', 'Summer sale - 20% off', 'PERCENTAGE', 20, 1000, 500, 50, '2026-06-30 23:59:59');
