import { Router } from "express";
import healthRoutes from "./health.routes.js";

/** Root router — add feature routers here (e.g. `router.use("/v1/users", usersRoutes)`). */
export const rootRouter = Router();

rootRouter.use(healthRoutes);
