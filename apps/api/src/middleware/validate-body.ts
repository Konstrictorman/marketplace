import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ValidationError } from "../lib/validation-error.js";

/** Parses `req.body` with `schema` and replaces it with the inferred type. */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError(result.error));
      return;
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}
