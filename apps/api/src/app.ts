import express from "express";
import cors from "cors";
import { getCorsOptions } from "./config/cors.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { rootRouter } from "./routes/index.js";

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());
  app.use(cors(getCorsOptions()));
  app.use("/api", rootRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
