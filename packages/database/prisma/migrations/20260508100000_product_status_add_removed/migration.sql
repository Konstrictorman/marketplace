-- Append `removed` label for ProductStatus (soft-delete final state).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'product_status'
      AND n.nspname = current_schema()
      AND e.enumlabel = 'removed'
  ) THEN
    ALTER TYPE "product_status" ADD VALUE 'removed';
  END IF;
END $$;
