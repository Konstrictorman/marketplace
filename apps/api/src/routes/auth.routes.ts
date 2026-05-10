import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { loginWithPassword } from "../services/auth.service.js";

const loginBodySchema = z.object({
  institutionalEmail: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200),
});

type LoginBody = z.infer<typeof loginBodySchema>;

const router = Router();

/** Browsers and “try URL” tools use GET; login is POST-only — avoid misleading `route_not_found`. */
router.get("/auth/login", (_req, res) => {
  res.setHeader("Allow", "POST");
  res.status(405).json({
    error: {
      code: "method_not_allowed",
      message:
        'Login requires POST /api/auth/login with JSON body: { "institutionalEmail", "password" }',
    },
  });
});

router.post(
  "/auth/login",
  validateBody(loginBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as LoginBody;
    const result = await loginWithPassword({
      institutionalEmail: body.institutionalEmail,
      password: body.password,
    });
    res.status(200).json({ data: result });
  }),
);

export default router;
