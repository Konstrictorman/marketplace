import type { ZodError } from "zod";
import { HttpError } from "./http-errors.js";

/** Thrown when request body or query fails Zod validation. */
export class ValidationError extends HttpError {
  constructor(zodError: ZodError) {
    super(
      400,
      "Request validation failed",
      "validation_failed",
      zodError.flatten(),
    );
    this.name = "ValidationError";
  }
}
