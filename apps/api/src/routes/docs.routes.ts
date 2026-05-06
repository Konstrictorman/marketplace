import { Router } from "express";
import * as swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../openapi/document.js";

const router = Router();

/** Raw OpenAPI document (for tooling / download). */
router.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

router.use(
  ...swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "Marketplace API — Swagger",
    explorer: true,
  }),
);

export default router;
