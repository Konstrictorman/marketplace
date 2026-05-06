-- Align Postgres enum labels with Prisma @map (lowercase / snake_case in DB).

-- ---------- product_status ----------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'product_status'
      AND n.nspname = current_schema()
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_status' AND n.nspname = current_schema() AND e.enumlabel = 'ACTIVE'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_status' AND n.nspname = current_schema() AND e.enumlabel = 'active'
    ) THEN
      ALTER TYPE "product_status" RENAME VALUE 'ACTIVE' TO 'active';
    END IF;

    IF EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_status' AND n.nspname = current_schema() AND e.enumlabel = 'INACTIVE'
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'product_status' AND n.nspname = current_schema() AND e.enumlabel = 'inactive'
    ) THEN
      ALTER TYPE "product_status" RENAME VALUE 'INACTIVE' TO 'inactive';
    END IF;
  END IF;
END $$;

-- ---------- order_status ----------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'order_status'
      AND n.nspname = current_schema()
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'PENDING')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'pending')
    THEN
      ALTER TYPE "order_status" RENAME VALUE 'PENDING' TO 'pending';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'CONFIRMED')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'confirmed')
    THEN
      ALTER TYPE "order_status" RENAME VALUE 'CONFIRMED' TO 'confirmed';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'DELIVERED')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'delivered')
    THEN
      ALTER TYPE "order_status" RENAME VALUE 'DELIVERED' TO 'delivered';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'CANCELLED')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'order_status' AND n.nspname = current_schema() AND e.enumlabel = 'cancelled')
    THEN
      ALTER TYPE "order_status" RENAME VALUE 'CANCELLED' TO 'cancelled';
    END IF;
  END IF;
END $$;

-- ---------- notification_status ----------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'notification_status'
      AND n.nspname = current_schema()
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'notification_status' AND n.nspname = current_schema() AND e.enumlabel = 'PENDING')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'notification_status' AND n.nspname = current_schema() AND e.enumlabel = 'pending')
    THEN
      ALTER TYPE "notification_status" RENAME VALUE 'PENDING' TO 'pending';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'notification_status' AND n.nspname = current_schema() AND e.enumlabel = 'SENT')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'notification_status' AND n.nspname = current_schema() AND e.enumlabel = 'sent')
    THEN
      ALTER TYPE "notification_status" RENAME VALUE 'SENT' TO 'sent';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'notification_status' AND n.nspname = current_schema() AND e.enumlabel = 'FAILED')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'notification_status' AND n.nspname = current_schema() AND e.enumlabel = 'failed')
    THEN
      ALTER TYPE "notification_status" RENAME VALUE 'FAILED' TO 'failed';
    END IF;
  END IF;
END $$;

-- ---------- report_status ----------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'report_status'
      AND n.nspname = current_schema()
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'OPEN')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'open')
    THEN
      ALTER TYPE "report_status" RENAME VALUE 'OPEN' TO 'open';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'UNDER_REVIEW')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'under_review')
    THEN
      ALTER TYPE "report_status" RENAME VALUE 'UNDER_REVIEW' TO 'under_review';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'RESOLVED')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'resolved')
    THEN
      ALTER TYPE "report_status" RENAME VALUE 'RESOLVED' TO 'resolved';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'DISMISSED')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_status' AND n.nspname = current_schema() AND e.enumlabel = 'dismissed')
    THEN
      ALTER TYPE "report_status" RENAME VALUE 'DISMISSED' TO 'dismissed';
    END IF;
  END IF;
END $$;

-- ---------- report_target_type ----------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'report_target_type'
      AND n.nspname = current_schema()
  ) THEN
    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'USER')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'user')
    THEN
      ALTER TYPE "report_target_type" RENAME VALUE 'USER' TO 'user';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'PRODUCT')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'product')
    THEN
      ALTER TYPE "report_target_type" RENAME VALUE 'PRODUCT' TO 'product';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'CONVERSATION')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'conversation')
    THEN
      ALTER TYPE "report_target_type" RENAME VALUE 'CONVERSATION' TO 'conversation';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'MESSAGE')
      AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typname = 'report_target_type' AND n.nspname = current_schema() AND e.enumlabel = 'message')
    THEN
      ALTER TYPE "report_target_type" RENAME VALUE 'MESSAGE' TO 'message';
    END IF;
  END IF;
END $$;
