-- Align Postgres enum labels with Prisma @map on ProductCondition (`new`, `used`).
-- Idempotent: skips if labels are already lowercase or source label is absent.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'product_condition'
      AND n.nspname = current_schema()
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_condition'
        AND n.nspname = current_schema()
        AND e.enumlabel = 'NEW'
    ) AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_condition'
        AND n.nspname = current_schema()
        AND e.enumlabel = 'new'
    ) THEN
      ALTER TYPE "product_condition" RENAME VALUE 'NEW' TO 'new';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_condition'
        AND n.nspname = current_schema()
        AND e.enumlabel = 'USED'
    ) AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_condition'
        AND n.nspname = current_schema()
        AND e.enumlabel = 'used'
    ) THEN
      ALTER TYPE "product_condition" RENAME VALUE 'USED' TO 'used';
    END IF;
  END IF;
END $$;
