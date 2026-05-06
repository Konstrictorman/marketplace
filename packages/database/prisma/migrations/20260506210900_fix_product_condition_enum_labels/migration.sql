-- Some local DBs can diverge so `USED`/`NEW` labels are missing on `product_condition`, which yields Postgres 22P02 on INSERT.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'product_condition'
      AND n.nspname = current_schema()
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_condition'
        AND n.nspname = current_schema()
        AND e.enumlabel = 'NEW'
    ) THEN
      ALTER TYPE "product_condition" ADD VALUE 'NEW';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_condition'
        AND n.nspname = current_schema()
        AND e.enumlabel = 'USED'
    ) THEN
      ALTER TYPE "product_condition" ADD VALUE 'USED';
    END IF;
  END IF;
END $$;
