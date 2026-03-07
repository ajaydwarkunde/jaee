CREATE TABLE stock_notifications (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP,
    UNIQUE(product_id, email)
);

CREATE INDEX idx_stock_notifications_product_active ON stock_notifications(product_id, is_active) WHERE is_active = true AND notified = false;
CREATE INDEX idx_stock_notifications_email ON stock_notifications(email);
