ALTER TABLE coupons ADD COLUMN IF NOT EXISTS limit_one_use_per_customer BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN coupons.limit_one_use_per_customer IS 'When true, each customer may use this coupon only once (tracks pending orders too). When false, same customer may redeem multiple times until global usageLimit.';
