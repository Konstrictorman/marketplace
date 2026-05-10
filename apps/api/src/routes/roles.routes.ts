import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  createRole,
  deleteRole,
  getRoleById,
  listRoles,
  updateRole,
} from "../services/roles.service.js";

function firstQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === "" ? undefined : s;
}

const roleIdParamsSchema = z.object({ roleId: z.string().uuid() });
type RoleIdParams = z.infer<typeof roleIdParamsSchema>;

const listRolesQuerySchema = z.object({
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
    z.string().trim().min(1).max(100).optional(),
  ),
});

type ListRolesQuery = z.infer<typeof listRolesQuerySchema>;

const createRoleBodySchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(5000).optional().nullable(),
});

type CreateRoleBody = z.infer<typeof createRoleBodySchema>;

const updateRoleBodySchema = z
  .object({
    name: z.string().trim().min(1).max(50).optional(),
    description: z.union([z.string().trim().max(5000), z.null()]).optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field must be provided to update",
  });

type UpdateRoleBody = z.infer<typeof updateRoleBodySchema>;

const router = Router();

router.get(
  "/roles",
  validateQuery(listRolesQuerySchema),
  asyncHandler(async (_req, res) => {
    const query = res.locals.validatedQuery as ListRolesQuery;
    const result = await listRoles({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
    });
    res.json(result);
  }),
);

router.get(
  "/roles/:roleId",
  validateParams(roleIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { roleId } = res.locals.validatedParams as RoleIdParams;
    const role = await getRoleById(roleId);
    res.json({ data: role });
  }),
);

router.post(
  "/roles",
  validateBody(createRoleBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateRoleBody;
    const role = await createRole({
      name: body.name,
      description: body.description ?? undefined,
    });
    res.status(201).json({ data: role });
  }),
);

router.patch(
  "/roles/:roleId",
  validateParams(roleIdParamsSchema),
  validateBody(updateRoleBodySchema),
  asyncHandler(async (req, res) => {
    const { roleId } = res.locals.validatedParams as RoleIdParams;
    const body = req.body as UpdateRoleBody;
    const role = await updateRole({
      id: roleId,
      name: body.name,
      description: body.description,
    });
    res.json({ data: role });
  }),
);

router.delete(
  "/roles/:roleId",
  validateParams(roleIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { roleId } = res.locals.validatedParams as RoleIdParams;
    await deleteRole(roleId);
    res.status(204).end();
  }),
);

export default router;
