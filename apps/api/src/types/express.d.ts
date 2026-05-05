export {};

declare global {
  namespace Express {
    interface Locals {
      /** Set by `validateQuery` middleware after successful parse. */
      validatedQuery?: unknown;
    }
  }
}
