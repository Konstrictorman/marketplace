import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ValidationError } from "../lib/validation-error.js";

/** Parses `req.params` with `schema` and assigns result to {@link Express.Locals.validatedParams}. */
export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new ValidationError(result.error));
      return;
    }
    res.locals.validatedParams = result.data as z.infer<T>;
    next();
  };
}
