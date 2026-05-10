import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "../services/users.service.js";

function firstQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === "" ? undefined : s;
}

const userIdParamsSchema = z.object({ userId: z.string().uuid() });
type UserIdParams = z.infer<typeof userIdParamsSchema>;

const reputationStringSchema = z
  .string()
  .trim()
  .regex(
    /^(?:[0-9](?:\.[0-9]{1,2})?)$/,
    "reputation must be between 0 and 9.99 with up to 2 decimals",
  );

const listUsersQuerySchema = z.object({
  page: z.preprocess(
    (v) => firstQueryString(v) ?? "1",
    z.coerce.number().int().min(1),
  ),
  pageSize: z.preprocess(
    (v) => firstQueryString(v) ?? "20",
    z.coerce.number().int().min(1).max(100),
  ),
  q: z.preprocess(
    (v) => firstQueryString(v),
    z.string().trim().min(1).max(200).optional(),
  ),
  isActive: z.preprocess(
    (v) => firstQueryString(v)?.toLowerCase(),
    z.enum(["true", "false"]).optional(),
  ),
  sortBy: z.preprocess(
    (v) => firstQueryString(v) ?? "createdAt",
    z.enum(["createdAt", "name", "institutionalEmail"]),
  ),
  sortOrder: z.preprocess(
    (v) => firstQueryString(v)?.toLowerCase() ?? "desc",
    z.enum(["asc", "desc"]),
  ),
});

type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

const createUserBodySchema = z.object({
  institutionalEmail: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(150),
  career: z.string().trim().max(150).optional().nullable(),
  photoUrl: z.string().url().max(2000).optional().nullable(),
});

type CreateUserBody = z.infer<typeof createUserBodySchema>;

const updateUserBodySchema = z
  .object({
    institutionalEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .max(255)
      .optional(),
    password: z.string().min(8).max(200).optional(),
    name: z.string().trim().min(1).max(150).optional(),
    career: z.union([z.string().trim().max(150), z.null()]).optional(),
    photoUrl: z.union([z.string().url().max(2000), z.null()]).optional(),
    reputation: reputationStringSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      [
        data.institutionalEmail,
        data.password,
        data.name,
        data.career,
        data.photoUrl,
        data.reputation,
        data.isActive,
      ].some((v) => v !== undefined),
    { message: "At least one field must be provided to update" },
  );

type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

const router = Router();

router.get(
  "/users",
  validateQuery(listUsersQuerySchema),
  asyncHandler(async (_req, res) => {
    const query = res.locals.validatedQuery as ListUsersQuery;
    const isActive =
      query.isActive === undefined ? undefined : query.isActive === "true";
    const result = await listUsers({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      isActive,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    res.json(result);
  }),
);

router.get(
  "/users/:userId",
  validateParams(userIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { userId } = res.locals.validatedParams as UserIdParams;
    const user = await getUserById(userId);
    res.json({ data: user });
  }),
);

router.post(
  "/users",
  validateBody(createUserBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateUserBody;
    const user = await createUser({
      institutionalEmail: body.institutionalEmail,
      password: body.password,
      name: body.name,
      career: body.career,
      photoUrl: body.photoUrl,
    });
    res.status(201).json({ data: user });
  }),
);

router.patch(
  "/users/:userId",
  validateParams(userIdParamsSchema),
  validateBody(updateUserBodySchema),
  asyncHandler(async (req, res) => {
    const { userId } = res.locals.validatedParams as UserIdParams;
    const body = req.body as UpdateUserBody;
    const user = await updateUser({
      id: userId,
      institutionalEmail: body.institutionalEmail,
      password: body.password,
      name: body.name,
      career: body.career,
      photoUrl: body.photoUrl,
      reputation: body.reputation,
      isActive: body.isActive,
    });
    res.json({ data: user });
  }),
);

router.delete(
  "/users/:userId",
  validateParams(userIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { userId } = res.locals.validatedParams as UserIdParams;
    await deleteUser(userId);
    res.status(204).end();
  }),
);

export default router;
