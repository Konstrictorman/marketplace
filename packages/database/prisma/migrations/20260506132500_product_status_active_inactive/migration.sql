-- Replace legacy product_status values with ACTIVE/INACTIVE only.
ALTER TYPE "product_status" RENAME TO "product_status_old";

CREATE TYPE "product_status" AS ENUM ('ACTIVE', 'INACTIVE');

ALTER TABLE "products"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "products"
  ALTER COLUMN "status" TYPE "product_status"
  USING (
    CASE
      WHEN "status"::text = 'ACTIVE' THEN 'ACTIVE'::"product_status"
      ELSE 'INACTIVE'::"product_status"
    END
  );

ALTER TABLE "products"
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

DROP TYPE "product_status_old";
