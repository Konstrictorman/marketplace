import { ProductCondition, ProductStatus } from "@marketplace/database";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  createProduct,
  deactivateProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/products.service.js";

const moneyPattern = /^\d+(\.\d{1,2})?$/;

/** Prisma enums use lowercase strings; accepts any casing from JSON. */
function prismaEnumFromJson<Enum extends Parameters<typeof z.nativeEnum>[0]>(
  enumeration: Enum,
) {
  return z.string().trim().toLowerCase().pipe(z.nativeEnum(enumeration));
}

const createProductBodySchema = z.object({
  sellerId: z.string().uuid(),
  categoryId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  price: z.string().regex(moneyPattern, "Price must have up to 2 decimals"),
  condition: prismaEnumFromJson(ProductCondition),
  inventory: z.number().int().min(0),
  status: z
    .preprocess(
      (v) =>
        v === undefined || v === null
          ? undefined
          : String(v).trim().toLowerCase(),
      z.nativeEnum(ProductStatus).optional(),
    )
    .default(ProductStatus.active),
});

type CreateProductBody = z.infer<typeof createProductBodySchema>;

const productIdParamsSchema = z.object({ id: z.string().uuid() });
type ProductIdParams = z.infer<typeof productIdParamsSchema>;

const updateProductBodySchema = z
  .object({
    sellerId: z.string().uuid(),
    categoryId: z.string().uuid().optional(),
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    price: z
      .string()
      .regex(moneyPattern, "Price must have up to 2 decimals")
      .optional(),
    condition: prismaEnumFromJson(ProductCondition).optional(),
    inventory: z.number().int().min(0).optional(),
    status: z.preprocess(
      (v) =>
        v === undefined || v === null
          ? undefined
          : String(v).trim().toLowerCase(),
      z.nativeEnum(ProductStatus).optional(),
    ),
  })
  .refine(
    (data) =>
      [
        data.categoryId,
        data.title,
        data.description,
        data.price,
        data.condition,
        data.inventory,
        data.status,
      ].some((v) => v !== undefined),
    { message: "At least one field must be provided to update" },
  );

type UpdateProductBody = z.infer<typeof updateProductBodySchema>;

const deleteProductBodySchema = z.object({
  sellerId: z.string().uuid(),
});

type DeleteProductBody = z.infer<typeof deleteProductBodySchema>;

/** First `req.query` value (Express may pass `string | string[]`). */
function firstQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === "" ? undefined : s;
}

const listProductsQuerySchema = z
  .object({
    page: z.preprocess(
      (v) => firstQueryString(v) ?? "1",
      z.coerce.number().int().min(1),
    ),
    pageSize: z.preprocess(
      (v) => firstQueryString(v) ?? "20",
      z.coerce.number().int().min(1).max(100),
    ),
    status: z.preprocess(
      (v) => firstQueryString(v)?.toLowerCase(),
      z.nativeEnum(ProductStatus).optional(),
    ),
    categoryId: z.preprocess(
      (v) => firstQueryString(v),
      z.string().uuid().optional(),
    ),
    sellerId: z.preprocess(
      (v) => firstQueryString(v),
      z.string().uuid().optional(),
    ),
    condition: z.preprocess(
      (v) => firstQueryString(v)?.toLowerCase(),
      z.nativeEnum(ProductCondition).optional(),
    ),
    minPrice: z.preprocess(
      (v) => firstQueryString(v),
      z
        .string()
        .regex(moneyPattern, "minPrice must have up to 2 decimals")
        .optional(),
    ),
    maxPrice: z.preprocess(
      (v) => firstQueryString(v),
      z
        .string()
        .regex(moneyPattern, "maxPrice must have up to 2 decimals")
        .optional(),
    ),
    q: z.preprocess(
      (v) => firstQueryString(v),
      z.string().trim().min(1).max(200).optional(),
    ),
    sortBy: z
      .preprocess((v) => firstQueryString(v) ?? "createdAt", z.string())
      .pipe(z.enum(["createdAt", "price", "title"])),
    sortOrder: z.preprocess(
      (v) => firstQueryString(v)?.toLowerCase() ?? "desc",
      z.enum(["asc", "desc"]),
    ),
  })
  .refine(
    (data) => {
      if (data.minPrice === undefined || data.maxPrice === undefined)
        return true;
      return Number(data.minPrice) <= Number(data.maxPrice);
    },
    {
      message: "minPrice must be less than or equal to maxPrice",
      path: ["minPrice"],
    },
  );

type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

const router = Router();

router.get(
  "/products",
  validateQuery(listProductsQuerySchema),
  asyncHandler(async (_req, res) => {
    const query = res.locals.validatedQuery as ListProductsQuery;
    const result = await listProducts(query);
    res.json(result);
  }),
);

router.post(
  "/products",
  validateBody(createProductBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateProductBody;
    const product = await createProduct(body);
    res.status(201).json({ data: product });
  }),
);

router.get(
  "/products/:id",
  validateParams(productIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { id } = res.locals.validatedParams as ProductIdParams;
    const product = await getProductById(id);
    res.json({ data: product });
  }),
);

router.patch(
  "/products/:id",
  validateParams(productIdParamsSchema),
  validateBody(updateProductBodySchema),
  asyncHandler(async (req, res) => {
    const { id } = res.locals.validatedParams as ProductIdParams;
    const body = req.body as UpdateProductBody;
    const product = await updateProduct({ id, ...body });
    res.json({ data: product });
  }),
);

router.delete(
  "/products/:id",
  validateParams(productIdParamsSchema),
  validateBody(deleteProductBodySchema),
  asyncHandler(async (req, res) => {
    const { id } = res.locals.validatedParams as ProductIdParams;
    const { sellerId } = req.body as DeleteProductBody;
    await deactivateProduct(id, sellerId);
    res.status(204).end();
  }),
);

export default router;
