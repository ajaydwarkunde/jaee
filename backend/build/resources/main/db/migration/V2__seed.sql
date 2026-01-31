-- Insert admin user (password: Admin@123)
INSERT INTO users (name, email, password_hash, role, email_verified)
VALUES ('Admin', 'admin@jaee.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGDJGK5dYJvpOvQ6Qs5Q7VRdAz6K', 'ADMIN', TRUE);

-- Insert demo user (password: Demo@123)
INSERT INTO users (name, email, password_hash, mobile_number, role, email_verified, mobile_verified)
VALUES ('Demo User', 'demo@jaee.com', '$2a$10$ZcKT6UjHk8UPJH5CZqNxEe2mDFqK7x1aLgxwGMBjHZt0VqJvPZR0K', '+919876543210', 'USER', TRUE, TRUE);

-- Insert categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Candles', 'candles', 'Beautiful handcrafted candles for every occasion', 'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=800'),
('Home Decor', 'home-decor', 'Elegant decor pieces to beautify your space', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'),
('Gift Sets', 'gift-sets', 'Perfect curated gift sets for your loved ones', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800'),
('Wellness', 'wellness', 'Self-care products for mind and body', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800');

-- Insert candle products
INSERT INTO products (name, slug, description, price, currency, category_id, stock_qty, active) VALUES
('Rose Garden Candle', 'rose-garden-candle', 'A delicate blend of fresh rose petals and morning dew. This luxurious candle brings the essence of an English rose garden into your home. Hand-poured with premium soy wax and cotton wicks for a clean, long-lasting burn.', 899.00, 'INR', 1, 50, TRUE),
('Lavender Dreams', 'lavender-dreams', 'Drift away with our calming lavender candle. Perfect for creating a peaceful atmosphere in your bedroom or bath. Made with pure lavender essential oil and natural soy wax.', 749.00, 'INR', 1, 75, TRUE),
('Vanilla Bliss', 'vanilla-bliss', 'Warm and inviting vanilla fragrance that fills your space with comfort. A bestseller that combines Madagascar vanilla with hints of warm amber. 40+ hours burn time.', 699.00, 'INR', 1, 100, TRUE),
('Ocean Breeze', 'ocean-breeze', 'Fresh and crisp scent reminiscent of a coastal morning. Notes of sea salt, driftwood, and clean musk create a refreshing atmosphere. Perfect for living spaces.', 799.00, 'INR', 1, 60, TRUE),
('Midnight Jasmine', 'midnight-jasmine', 'Exotic and enchanting jasmine fragrance for evening ambiance. The intoxicating scent of night-blooming jasmine with subtle woody undertones.', 949.00, 'INR', 1, 40, TRUE),
('Citrus Sunrise', 'citrus-sunrise', 'Energizing blend of orange, lemon, and grapefruit. Wake up your senses with this vibrant, uplifting citrus candle. Perfect for kitchens and workspaces.', 649.00, 'INR', 1, 80, TRUE);

-- Insert home decor products
INSERT INTO products (name, slug, description, price, currency, category_id, stock_qty, active) VALUES
('Ceramic Candle Holder', 'ceramic-candle-holder', 'Elegant handcrafted ceramic holder with a delicate floral pattern. Perfect for displaying your favorite candles or as a standalone decor piece.', 599.00, 'INR', 2, 30, TRUE),
('Wooden Tray Set', 'wooden-tray-set', 'Set of 3 nesting wooden trays in natural finish. Ideal for organizing candles, displaying decor, or serving. Made from sustainable mango wood.', 1299.00, 'INR', 2, 25, TRUE);

-- Insert gift set products
INSERT INTO products (name, slug, description, price, currency, category_id, stock_qty, active) VALUES
('Signature Collection Box', 'signature-collection-box', 'Our bestselling gift set featuring 4 mini candles (Rose, Lavender, Vanilla, Jasmine). Beautifully packaged in a premium gift box. Perfect for any occasion.', 1999.00, 'INR', 3, 45, TRUE),
('Self-Care Gift Set', 'self-care-gift-set', 'Pamper yourself or someone special with this curated collection. Includes 1 large candle, bath salts, and a silk eye mask. Wrapped in sustainable packaging.', 2499.00, 'INR', 3, 35, TRUE);

-- Insert wellness products
INSERT INTO products (name, slug, description, price, currency, category_id, stock_qty, active) VALUES
('Aromatherapy Diffuser', 'aromatherapy-diffuser', 'Ultrasonic essential oil diffuser with ambient lighting. Whisper-quiet operation with auto shut-off. Compatible with all Jaee essential oils.', 1799.00, 'INR', 4, 40, TRUE),
('Essential Oil Set', 'essential-oil-set', 'Set of 6 pure essential oils: Lavender, Eucalyptus, Peppermint, Tea Tree, Lemon, and Orange. 100% natural, therapeutic grade.', 1299.00, 'INR', 4, 55, TRUE);

-- Insert product images
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=800'),
(1, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'),
(1, 'https://images.unsplash.com/photo-1608178398319-48f814d0750c?w=800'),
(2, 'https://images.unsplash.com/photo-1599321329467-7dc6c0e8b1ec?w=800'),
(2, 'https://images.unsplash.com/photo-1611079829529-7a3e6e1e3e1e?w=800'),
(3, 'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?w=800'),
(3, 'https://images.unsplash.com/photo-1595587870672-c79b47875c6a?w=800'),
(4, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),
(5, 'https://images.unsplash.com/photo-1602523961358-24a68d4e5a9c?w=800'),
(6, 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800'),
(7, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'),
(8, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800'),
(9, 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800'),
(10, 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800'),
(11, 'https://images.unsplash.com/photo-1605651203557-b0834ef1c067?w=800'),
(12, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800');
