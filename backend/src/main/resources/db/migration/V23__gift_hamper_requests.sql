CREATE TABLE gift_hamper_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    hamper_size VARCHAR(50) NOT NULL,
    occasion VARCHAR(50) NOT NULL,
    items TEXT NOT NULL,
    wrapping VARCHAR(50) NOT NULL,
    message_card TEXT,
    recipient_name VARCHAR(255),
    color_theme VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 1,
    estimated_price DECIMAL(10, 2),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gift_hamper_requests_user ON gift_hamper_requests(user_id);
CREATE INDEX idx_gift_hamper_requests_status ON gift_hamper_requests(status);
CREATE INDEX idx_gift_hamper_requests_created_at ON gift_hamper_requests(created_at DESC);
