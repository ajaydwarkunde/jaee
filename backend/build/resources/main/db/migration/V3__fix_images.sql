-- Fix product images with verified working Unsplash URLs

-- Clear existing images
DELETE FROM product_images;

-- Re-insert with working URLs
INSERT INTO product_images (product_id, image_url) VALUES
-- Rose Garden Candle
(1, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(1, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'),
(1, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800'),
-- Lavender Dreams
(2, 'https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?w=800'),
(2, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'),
-- Vanilla Bliss
(3, 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800'),
(3, 'https://images.unsplash.com/photo-1608181831718-2501c44c0068?w=800'),
-- Ocean Breeze
(4, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),
(4, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800'),
-- Midnight Jasmine
(5, 'https://images.unsplash.com/photo-1596476170555-03c4ea1cb0c3?w=800'),
(5, 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800'),
-- Citrus Sunrise
(6, 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800'),
(6, 'https://images.unsplash.com/photo-1607006483224-af79af9d0c2f?w=800'),
-- Ceramic Candle Holder
(7, 'https://images.unsplash.com/photo-1603905179682-6da4cb8d2b92?w=800'),
-- Wooden Tray Set
(8, 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800'),
-- Signature Collection Box
(9, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'),
(9, 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800'),
-- Self-Care Gift Set
(10, 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800'),
(10, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800'),
-- Aromatherapy Diffuser
(11, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800'),
(11, 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800'),
-- Essential Oil Set
(12, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800'),
(12, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800');

-- Update category images
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800' WHERE slug = 'candles';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800' WHERE slug = 'home-decor';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800' WHERE slug = 'gift-sets';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800' WHERE slug = 'wellness';
