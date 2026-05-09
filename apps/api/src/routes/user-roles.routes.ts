import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import {
  assignUserRole,
  listUserRoles,
  removeUserRole,
} from "../services/user-roles.service.js";

const userIdParamsSchema = z.object({ userId: z.string().uuid() });
type UserIdParams = z.infer<typeof userIdParamsSchema>;

const userIdRoleIdParamsSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});
type UserIdRoleIdParams = z.infer<typeof userIdRoleIdParamsSchema>;

const assignUserRoleBodySchema = z.object({
  roleId: z.string().uuid(),
});

type AssignUserRoleBody = z.infer<typeof assignUserRoleBodySchema>;

const router = Router();

router.get(
  "/users/:userId/roles",
  validateParams(userIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { userId } = res.locals.validatedParams as UserIdParams;
    const data = await listUserRoles(userId);
    res.json({ data });
  }),
);

router.post(
  "/users/:userId/roles",
  validateParams(userIdParamsSchema),
  validateBody(assignUserRoleBodySchema),
  asyncHandler(async (req, res) => {
    const { userId } = res.locals.validatedParams as UserIdParams;
    const body = req.body as AssignUserRoleBody;
    const row = await assignUserRole(userId, body.roleId);
    res.status(201).json({ data: row });
  }),
);

router.delete(
  "/users/:userId/roles/:roleId",
  validateParams(userIdRoleIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { userId, roleId } = res.locals.validatedParams as UserIdRoleIdParams;
    await removeUserRole(userId, roleId);
    res.status(204).end();
  }),
);

export default router;
