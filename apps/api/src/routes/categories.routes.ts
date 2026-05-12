import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../services/categories.service.js";

function firstQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === "" ? undefined : s;
}

const categoryIdParamsSchema = z.object({
  categoryId: z.string().uuid(),
});
type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;

const listCategoriesQuerySchema = z.object({
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
  isActive: z.preprocess(
    (v) => firstQueryString(v)?.toLowerCase(),
    z.enum(["true", "false"]).optional(),
  ),
});

type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

const createCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(20_000).optional().nullable(),
  isActive: z.boolean().optional(),
});

type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;

const updateCategoryBodySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.union([z.string().trim().max(20_000), z.null()]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.isActive !== undefined,
    { message: "At least one field must be provided to update" },
  );

type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;

const router = Router();

router.get(
  "/categories",
  validateQuery(listCategoriesQuerySchema),
  asyncHandler(async (_req, res) => {
    const query = res.locals.validatedQuery as ListCategoriesQuery;
    const isActive =
      query.isActive === undefined ? undefined : query.isActive === "true";
    const result = await listCategories({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      isActive,
    });
    res.json(result);
  }),
);

router.get(
  "/categories/:categoryId",
  validateParams(categoryIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { categoryId } = res.locals.validatedParams as CategoryIdParams;
    const category = await getCategoryById(categoryId);
    res.json({ data: category });
  }),
);

router.post(
  "/categories",
  validateBody(createCategoryBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateCategoryBody;
    const category = await createCategory({
      name: body.name,
      description: body.description ?? undefined,
      isActive: body.isActive,
    });
    res.status(201).json({ data: category });
  }),
);

router.patch(
  "/categories/:categoryId",
  validateParams(categoryIdParamsSchema),
  validateBody(updateCategoryBodySchema),
  asyncHandler(async (req, res) => {
    const { categoryId } = res.locals.validatedParams as CategoryIdParams;
    const body = req.body as UpdateCategoryBody;
    const category = await updateCategory({
      id: categoryId,
      name: body.name,
      description: body.description,
      isActive: body.isActive,
    });
    res.json({ data: category });
  }),
);

router.delete(
  "/categories/:categoryId",
  validateParams(categoryIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { categoryId } = res.locals.validatedParams as CategoryIdParams;
    await deleteCategory(categoryId);
    res.status(204).end();
  }),
);

export default router;
