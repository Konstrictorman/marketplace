import { Router } from "express";
import authRoutes from "./auth.routes.js";
import conversationParticipantsRoutes from "./conversation-participants.routes.js";
import conversationsRoutes from "./conversations.routes.js";
import docsRoutes from "./docs.routes.js";
import healthRoutes from "./health.routes.js";
import ordersRoutes from "./orders.routes.js";
import productImagesRoutes from "./product-images.routes.js";
import productsRoutes from "./products.routes.js";
import rolesRoutes from "./roles.routes.js";
import uploadsRoutes from "./uploads.routes.js";
import userRolesRoutes from "./user-roles.routes.js";
import usersRoutes from "./users.routes.js";

/**
 * Feature routers composed here; mounted at `/api` in `app.ts` (e.g. `GET /api/health`).
 */
export const rootRouter = Router();

/** Must stay under `/docs` — `swaggerUi.setup()` answers HTML for any request that reaches it. */
rootRouter.use("/docs", docsRoutes);
rootRouter.use(healthRoutes);
rootRouter.use(uploadsRoutes);
rootRouter.use(authRoutes);
rootRouter.use(ordersRoutes);
rootRouter.use(conversationParticipantsRoutes);
rootRouter.use(conversationsRoutes);
rootRouter.use(productImagesRoutes);
rootRouter.use(productsRoutes);
rootRouter.use(rolesRoutes);
rootRouter.use(userRolesRoutes);
rootRouter.use(usersRoutes);
