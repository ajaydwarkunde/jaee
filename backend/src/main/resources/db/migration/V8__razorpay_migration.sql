-- Migrate from Stripe to Razorpay
-- Rename columns in orders table

ALTER TABLE orders RENAME COLUMN stripe_session_id TO razorpay_order_id;
ALTER TABLE orders RENAME COLUMN stripe_payment_intent_id TO razorpay_payment_id;
