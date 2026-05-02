-- Products without variant option names get the standard Size + Scent dimensions.
INSERT INTO product_option_names (product_id, option_name)
SELECT p.id, v.option_name
FROM products p
CROSS JOIN (VALUES ('Size'), ('Scent')) AS v(option_name)
WHERE NOT EXISTS (
    SELECT 1 FROM product_option_names pon WHERE pon.product_id = p.id
);
