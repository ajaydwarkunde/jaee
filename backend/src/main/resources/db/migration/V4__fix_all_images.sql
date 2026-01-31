-- Fix ALL product images with verified candle/home decor related Unsplash URLs

-- Clear existing images
DELETE FROM product_images;

-- Re-insert with verified working candle/decor URLs
INSERT INTO product_images (product_id, image_url) VALUES
-- Rose Garden Candle (ID: 1)
(1, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(1, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),
(1, 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800'),

-- Lavender Dreams (ID: 2)
(2, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800'),
(2, 'https://images.unsplash.com/photo-1608181831718-2501c44c0068?w=800'),

-- Vanilla Bliss (ID: 3)
(3, 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800'),
(3, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),

-- Ocean Breeze (ID: 4)
(4, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),
(4, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800'),

-- Midnight Jasmine (ID: 5)
(5, 'https://images.unsplash.com/photo-1608181831718-2501c44c0068?w=800'),
(5, 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800'),

-- Citrus Sunrise (ID: 6)
(6, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(6, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),

-- Ceramic Candle Holder (ID: 7)
(7, 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800'),
(7, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800'),

-- Wooden Tray Set (ID: 8)
(8, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(8, 'https://images.unsplash.com/photo-1608181831718-2501c44c0068?w=800'),

-- Signature Collection Box (ID: 9)
(9, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),
(9, 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800'),

-- Self-Care Gift Set (ID: 10)
(10, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800'),
(10, 'https://images.unsplash.com/photo-1608181831718-2501c44c0068?w=800'),

-- Aromatherapy Diffuser (ID: 11)
(11, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(11, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),

-- Essential Oil Set (ID: 12)
(12, 'https://images.unsplash.com/photo-1608181831718-2501c44c0068?w=800'),
(12, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800');

-- Update category images with verified URLs
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800' WHERE slug = 'candles';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800' WHERE slug = 'home-decor';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800' WHERE slug = 'gift-sets';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1608181831718-2501c44c0068?w=800' WHERE slug = 'wellness';
