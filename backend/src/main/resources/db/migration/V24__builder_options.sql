CREATE TABLE builder_options (
    id BIGSERIAL PRIMARY KEY,
    builder_type VARCHAR(20) NOT NULL,
    option_type VARCHAR(30) NOT NULL,
    option_key VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    hex_color VARCHAR(7),
    colors_json VARCHAR(255),
    base_price DECIMAL(10, 2) DEFAULT 0,
    surcharge DECIMAL(10, 2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    CONSTRAINT uq_builder_options_type_key UNIQUE (builder_type, option_type, option_key)
);

CREATE INDEX idx_builder_options_builder_type ON builder_options(builder_type);
CREATE INDEX idx_builder_options_option_type ON builder_options(option_type);
CREATE INDEX idx_builder_options_builder_type_option_type ON builder_options(builder_type, option_type);

-- CANDLE: SIZE
INSERT INTO builder_options (builder_type, option_type, option_key, label, base_price, display_order) VALUES
('CANDLE', 'SIZE', 'small', 'Small', 499, 1),
('CANDLE', 'SIZE', 'medium', 'Medium', 799, 2),
('CANDLE', 'SIZE', 'large', 'Large', 1299, 3);

-- CANDLE: WAX
INSERT INTO builder_options (builder_type, option_type, option_key, label, surcharge, display_order) VALUES
('CANDLE', 'WAX', 'soy', 'Soy', 0, 1),
('CANDLE', 'WAX', 'beeswax', 'Beeswax', 200, 2),
('CANDLE', 'WAX', 'coconut', 'Coconut', 150, 3),
('CANDLE', 'WAX', 'paraffin', 'Paraffin', 0, 4);

-- CANDLE: SCENT
INSERT INTO builder_options (builder_type, option_type, option_key, label, emoji, surcharge, display_order) VALUES
('CANDLE', 'SCENT', 'lavender', 'Lavender', '🌿', 100, 1),
('CANDLE', 'SCENT', 'vanilla', 'Vanilla', '🍦', 100, 2),
('CANDLE', 'SCENT', 'rose', 'Rose', '🌹', 100, 3),
('CANDLE', 'SCENT', 'sandalwood', 'Sandalwood', '🪵', 100, 4),
('CANDLE', 'SCENT', 'jasmine', 'Jasmine', '🌼', 100, 5),
('CANDLE', 'SCENT', 'cinnamon', 'Cinnamon', '🍂', 100, 6),
('CANDLE', 'SCENT', 'ocean-breeze', 'Ocean Breeze', '🌊', 100, 7),
('CANDLE', 'SCENT', 'unscented', 'Unscented', '➖', 0, 8);

-- CANDLE: COLOR
INSERT INTO builder_options (builder_type, option_type, option_key, label, hex_color, display_order) VALUES
('CANDLE', 'COLOR', 'ivory', 'Ivory', '#FBF6F3', 1),
('CANDLE', 'COLOR', 'blush', 'Blush', '#F2E3E8', 2),
('CANDLE', 'COLOR', 'champagne', 'Champagne', '#E4D5CF', 3),
('CANDLE', 'COLOR', 'berry', 'Berry', '#923C5B', 4),
('CANDLE', 'COLOR', 'rose', 'Rose', '#B4617B', 5),
('CANDLE', 'COLOR', 'gold', 'Gold', '#D4A843', 6),
('CANDLE', 'COLOR', 'sage', 'Sage', '#6B9E76', 7),
('CANDLE', 'COLOR', 'charcoal', 'Charcoal', '#2D2D2D', 8),
('CANDLE', 'COLOR', 'amber', 'Amber', '#8B5E3C', 9),
('CANDLE', 'COLOR', 'sand', 'Sand', '#C4A882', 10);

-- CANDLE: CONTAINER
INSERT INTO builder_options (builder_type, option_type, option_key, label, surcharge, display_order) VALUES
('CANDLE', 'CONTAINER', 'jar', 'Jar', 0, 1),
('CANDLE', 'CONTAINER', 'tin', 'Tin', 50, 2),
('CANDLE', 'CONTAINER', 'ceramic', 'Ceramic', 300, 3),
('CANDLE', 'CONTAINER', 'pillar', 'Pillar', -50, 4),
('CANDLE', 'CONTAINER', 'votive', 'Votive', -100, 5);

-- HAMPER: SIZE
INSERT INTO builder_options (builder_type, option_type, option_key, label, base_price, display_order) VALUES
('HAMPER', 'SIZE', 'small', 'Petite', 999, 1),
('HAMPER', 'SIZE', 'medium', 'Classic', 1999, 2),
('HAMPER', 'SIZE', 'large', 'Grand', 2999, 3),
('HAMPER', 'SIZE', 'premium', 'Luxe', 4999, 4);

-- HAMPER: OCCASION
INSERT INTO builder_options (builder_type, option_type, option_key, label, emoji, display_order) VALUES
('HAMPER', 'OCCASION', 'birthday', 'Birthday', '🎂', 1),
('HAMPER', 'OCCASION', 'wedding', 'Wedding', '💒', 2),
('HAMPER', 'OCCASION', 'anniversary', 'Anniversary', '💝', 3),
('HAMPER', 'OCCASION', 'housewarming', 'Housewarming', '🏠', 4),
('HAMPER', 'OCCASION', 'thankyou', 'Thank You', '🙏', 5),
('HAMPER', 'OCCASION', 'corporate', 'Corporate', '💼', 6),
('HAMPER', 'OCCASION', 'festival', 'Festival', '🎉', 7),
('HAMPER', 'OCCASION', 'other', 'Other', '🎁', 8);

-- HAMPER: ITEM
INSERT INTO builder_options (builder_type, option_type, option_key, label, emoji, surcharge, display_order) VALUES
('HAMPER', 'ITEM', 'candle', 'Candle', '🕯️', 200, 1),
('HAMPER', 'ITEM', 'diffuser', 'Diffuser', '🌸', 350, 2),
('HAMPER', 'ITEM', 'bath-salts', 'Bath Salts', '🛁', 150, 3),
('HAMPER', 'ITEM', 'chocolates', 'Chocolates', '🍫', 250, 4),
('HAMPER', 'ITEM', 'dried-flowers', 'Dried Flowers', '🌷', 200, 5),
('HAMPER', 'ITEM', 'soap', 'Soap', '🧼', 100, 6),
('HAMPER', 'ITEM', 'tea', 'Tea', '🍵', 150, 7),
('HAMPER', 'ITEM', 'essential-oils', 'Essential Oils', '💧', 300, 8);

-- HAMPER: WRAPPING
INSERT INTO builder_options (builder_type, option_type, option_key, label, surcharge, display_order) VALUES
('HAMPER', 'WRAPPING', 'classic', 'Classic', 0, 1),
('HAMPER', 'WRAPPING', 'luxury', 'Luxury', 200, 2),
('HAMPER', 'WRAPPING', 'eco-friendly', 'Eco-Friendly', 100, 3),
('HAMPER', 'WRAPPING', 'festive', 'Festive', 150, 4);

-- HAMPER: COLOR_THEME
INSERT INTO builder_options (builder_type, option_type, option_key, label, colors_json, display_order) VALUES
('HAMPER', 'COLOR_THEME', 'rose-gold', 'Rose Gold', '["#B4617B","#D4A843","#F2E3E8"]', 1),
('HAMPER', 'COLOR_THEME', 'pastels', 'Pastels', '["#F2E3E8","#E8F4F8","#F5F0E8"]', 2),
('HAMPER', 'COLOR_THEME', 'earth-tones', 'Earth Tones', '["#8B5E3C","#6B9E76","#E4D5CF"]', 3),
('HAMPER', 'COLOR_THEME', 'monochrome', 'Monochrome', '["#2D2D2D","#6B6B6B","#E8E8E8"]', 4),
('HAMPER', 'COLOR_THEME', 'vibrant', 'Vibrant', '["#923C5B","#D4A843","#6B9E76"]', 5);
