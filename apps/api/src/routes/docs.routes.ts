import { Router } from "express";
import * as swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../openapi/document.js";

const router = Router();

/** Raw OpenAPI document (for tooling / download). */
router.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

/**
 * Load the spec by URL instead of embedding it in `swagger-ui-init.js`. Large or
 * richly-quoted OpenAPI docs can break the UI when inlined (invalid JS / parse errors).
 */
router.use(
  ...swaggerUi.serve,
  swaggerUi.setup(undefined, {
    customSiteTitle: "Marketplace API — Swagger",
    explorer: true,
    /** Absolute path from the API host (mounted under `/api` + `/docs`). */
    swaggerUrl: "/api/docs/openapi.json",
  }),
);

export default router;
