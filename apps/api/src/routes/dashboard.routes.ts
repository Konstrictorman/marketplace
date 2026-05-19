import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import {
  getProductsPublishedLastMonth,
  getSalesByCategory,
} from "../services/dashboard.service.js";

const router = Router();

router.get(
  "/dashboard/sales-by-category",
  asyncHandler(async (_req, res) => {
    const data = await getSalesByCategory();
    res.json({ data });
  }),
);

router.get(
  "/dashboard/products-published",
  asyncHandler(async (_req, res) => {
    const data = await getProductsPublishedLastMonth();
    res.json({ data });
  }),
);

export default router;
