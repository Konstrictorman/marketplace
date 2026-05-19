-- AlterTable
ALTER TABLE "products" ADD COLUMN "rating" DECIMAL(3,2) NOT NULL DEFAULT 0;

ALTER TABLE "products" ADD CONSTRAINT "products_rating_check" CHECK (rating >= 0 AND rating <= 5);
