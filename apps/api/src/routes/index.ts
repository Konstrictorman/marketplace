import { Router } from "express";
import docsRoutes from "./docs.routes.js";
import healthRoutes from "./health.routes.js";
import productsRoutes from "./products.routes.js";

/**
 * Feature routers composed here; mounted at `/api` in `app.ts` (e.g. `GET /api/health`).
 */
export const rootRouter = Router();

rootRouter.use(docsRoutes);
rootRouter.use(healthRoutes);
rootRouter.use(productsRoutes);
