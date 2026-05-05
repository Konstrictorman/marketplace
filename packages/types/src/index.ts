/**
 * Hand-written types shared by `apps/api` and `apps/web` (DTOs, query shapes,
 * constants). Do not import the Prisma client here — use `@marketplace/database`
 * only in server-side code (e.g. the API).
 */

/** Common pagination query for list endpoints. */
export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};
