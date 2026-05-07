import { Router } from "express";
import docsRoutes from "./docs.routes.js";
import healthRoutes from "./health.routes.js";
import productImagesRoutes from "./product-images.routes.js";
import productsRoutes from "./products.routes.js";

/**
 * Feature routers composed here; mounted at `/api` in `app.ts` (e.g. `GET /api/health`).
 */
export const rootRouter = Router();

/** Must stay under `/docs` — `swaggerUi.setup()` answers HTML for any request that reaches it. */
rootRouter.use("/docs", docsRoutes);
rootRouter.use(healthRoutes);
rootRouter.use(productImagesRoutes);
rootRouter.use(productsRoutes);
