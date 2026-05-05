import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-errors.js";
import { checkDatabase } from "../services/health.service.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.type("text/plain").send("Hello Marketplace !");
});

router.get(
  "/health/db",
  asyncHandler(async (_req, res) => {
    try {
      await checkDatabase();
      res.json({ ok: true });
    } catch {
      throw new HttpError(503, "Database unreachable", "database_unreachable");
    }
  }),
);

export default router;
