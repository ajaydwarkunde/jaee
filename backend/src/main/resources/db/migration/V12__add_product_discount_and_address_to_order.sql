-- Add compare_at_price (original price before discount) to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10, 2);

-- Add address_id to orders table for linking shipping address
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_id BIGINT REFERENCES addresses(id) ON DELETE SET NULL;
