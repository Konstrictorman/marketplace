-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "rating" DECIMAL(3,2);

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_rating_check" CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_rating_check";

ALTER TABLE "products" DROP COLUMN IF EXISTS "rating";

-- CreateIndex
CREATE INDEX "idx_order_items_product_rating" ON "order_items"("product_id") WHERE rating IS NOT NULL;
