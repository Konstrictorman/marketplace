import express from "express";
import cors from "cors";
import { getCorsOptions } from "./config/cors.js";
import { ensureUploadDir, getUploadDir } from "./config/uploads.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { rootRouter } from "./routes/index.js";

export function createApp(): express.Express {
  const app = express();

  ensureUploadDir();
  /** Before static routes so OPTIONS preflight and error responses still get CORS headers. */
  app.use(cors(getCorsOptions()));

  const uploadDir = getUploadDir();
  const staticUploadOpts = {
    index: false,
    fallthrough: false,
    maxAge: "7d" as const,
  };
  /** Canonical URL prefix: `PUBLIC_UPLOAD_URL_BASE` + `/filename` (no `/api`). */
  app.use("/uploads", express.static(uploadDir, staticUploadOpts));
  /**
   * GET/HEAD alias under `/api/uploads/...` for convenience. Must not handle POST — that path
   * is the multipart upload route (`POST /api/uploads`).
   */
  const serveUploadFilesStatic = express.static(uploadDir, staticUploadOpts);
  app.use("/api/uploads", (req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
      serveUploadFilesStatic(req, res, next);
      return;
    }
    next();
  });

  app.use(express.json());
  app.use("/api", rootRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
