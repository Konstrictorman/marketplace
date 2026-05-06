export {};

declare global {
  namespace Express {
    interface Locals {
      /** Set by `validateQuery` middleware after successful parse. */
      validatedQuery?: unknown;
      /** Set by `validateParams` middleware after successful parse. */
      validatedParams?: unknown;
    }
  }
}
