import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ValidationError } from "../lib/validation-error.js";

/** Parses `req.query` with `schema` and assigns the result to `res.locals.validatedQuery`. */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError(result.error));
      return;
    }
    res.locals.validatedQuery = result.data as z.infer<T>;
    next();
  };
}
