-- Clear all product images and insert verified working URLs
TRUNCATE product_images;

INSERT INTO product_images (product_id, image_url) VALUES
-- Rose Garden Candle (id: 1)
(1, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(1, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800'),

-- Lavender Dreams (id: 2)
(2, 'https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?w=800'),
(2, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'),

-- Vanilla Bliss (id: 3)
(3, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(3, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800'),

-- Ocean Breeze (id: 4)
(4, 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800'),
(4, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),

-- Midnight Jasmine (id: 5)
(5, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),
(5, 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800'),

-- Citrus Sunrise (id: 6)
(6, 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800'),
(6, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),

-- Ceramic Candle Holder (id: 7)
(7, 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800'),
(7, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),

-- Wooden Tray Set (id: 8)
(8, 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800'),
(8, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),

-- Signature Collection Box (id: 9)
(9, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'),
(9, 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800'),

-- Self-Care Gift Set (id: 10)
(10, 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800'),
(10, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800'),

-- Aromatherapy Diffuser (id: 11)
(11, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800'),

-- Essential Oil Set (id: 12)
(12, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800');
