-- Move product rating from `products` to per-purchase ratings on `order_items`.
-- Product rating shown in the UI = AVG(order_items.rating) WHERE rating IS NOT NULL.

ALTER TABLE order_items
  ADD COLUMN rating DECIMAL(3, 2);

ALTER TABLE order_items
  ADD CONSTRAINT order_items_rating_check
  CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_rating_check;

ALTER TABLE products
  DROP COLUMN IF EXISTS rating;

-- Optional: speeds up AVG(rating) per product
CREATE INDEX IF NOT EXISTS idx_order_items_product_rating
  ON order_items (product_id)
  WHERE rating IS NOT NULL;
