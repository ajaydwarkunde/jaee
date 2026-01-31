-- Fix category images with verified working Unsplash URLs
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800' WHERE slug = 'candles';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800' WHERE slug = 'home-decor';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800' WHERE slug = 'gift-sets';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800' WHERE slug = 'wellness';
