CREATE TABLE IF NOT EXISTS product_videos (
    product_id BIGINT NOT NULL,
    video_url  VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_product_videos_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_videos_product_id ON product_videos(product_id);
