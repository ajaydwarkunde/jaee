-- Join table for many-to-many product ↔ category
CREATE TABLE IF NOT EXISTS product_categories (
    product_id  BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_pc_product  FOREIGN KEY (product_id)  REFERENCES products(id)    ON DELETE CASCADE,
    CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE CASCADE
);

CREATE INDEX idx_product_categories_product  ON product_categories(product_id);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);

-- Migrate existing single-category data
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Drop the old column
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
