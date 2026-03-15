-- Option names defined at the product level (e.g., "Size", "Color", "Scent")
CREATE TABLE IF NOT EXISTS product_option_names (
    product_id  BIGINT NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_product_option_names_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_option_names_product ON product_option_names(product_id);

-- Product variants (each combination of options)
CREATE TABLE IF NOT EXISTS product_variants (
    id               BIGSERIAL PRIMARY KEY,
    product_id       BIGINT NOT NULL,
    sku              VARCHAR(100),
    price            DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    stock_qty        INTEGER DEFAULT 0,
    active           BOOLEAN DEFAULT true,
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- Option values for each variant (e.g., "Size" -> "Large", "Color" -> "Red")
CREATE TABLE IF NOT EXISTS product_variant_options (
    variant_id   BIGINT NOT NULL,
    option_name  VARCHAR(100) NOT NULL,
    option_value VARCHAR(200) NOT NULL,
    CONSTRAINT fk_variant_options_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE INDEX idx_variant_options_variant ON product_variant_options(variant_id);

-- Variant-specific images
CREATE TABLE IF NOT EXISTS product_variant_images (
    variant_id BIGINT NOT NULL,
    image_url  VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_variant_images_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE INDEX idx_variant_images_variant ON product_variant_images(variant_id);
