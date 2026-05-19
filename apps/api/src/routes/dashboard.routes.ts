import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { getSalesByCategory } from "../services/dashboard.service.js";

const router = Router();

router.get(
  "/dashboard/sales-by-category",
  asyncHandler(async (_req, res) => {
    const data = await getSalesByCategory();
    res.json({ data });
  }),
);

export default router;
