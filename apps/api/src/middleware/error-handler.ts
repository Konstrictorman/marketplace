import { Prisma } from "@marketplace/database";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../lib/http-errors.js";
import { ValidationError } from "../lib/validation-error.js";
import { ZodError } from "zod";

type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new HttpError(
      404,
      `Route not found: ${req.method} ${req.path}`,
      "route_not_found",
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  next,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const body: ErrorBody = {
    error: {
      code: "internal_error",
      message: "An unexpected error occurred",
    },
  };

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "validation_failed",
        message: "Request validation failed",
        details: err.flatten(),
      },
    });
    return;
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    res.status(503).json({
      error: {
        code: "database_unavailable",
        message: "Database is unavailable",
      },
    });
    return;
  }

  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    body.error.message = err.message;
    body.error.code = "internal_error";
    console.error(err);
  }

  res.status(500).json(body);
};
