CREATE TABLE custom_candle_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    size VARCHAR(50) NOT NULL,
    wax_type VARCHAR(50) NOT NULL,
    scent VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL,
    container VARCHAR(50) NOT NULL,
    label_text VARCHAR(500),
    quantity INTEGER DEFAULT 1,
    estimated_price DECIMAL(10, 2),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_custom_candle_requests_user ON custom_candle_requests(user_id);
CREATE INDEX idx_custom_candle_requests_status ON custom_candle_requests(status);
CREATE INDEX idx_custom_candle_requests_created_at ON custom_candle_requests(created_at DESC);
