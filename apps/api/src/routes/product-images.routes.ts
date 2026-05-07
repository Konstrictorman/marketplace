import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import {
  createProductImage,
  deleteProductImage,
  getProductImage,
  listProductImages,
  updateProductImage,
} from "../services/product-images.service.js";

const productIdForImagesParamsSchema = z.object({
  productId: z.string().uuid(),
});

type ProductIdForImagesParams = z.infer<typeof productIdForImagesParamsSchema>;

const productImageIdParamsSchema = z.object({
  productId: z.string().uuid(),
  imageId: z.string().uuid(),
});

type ProductImageIdParams = z.infer<typeof productImageIdParamsSchema>;

const createProductImageBodySchema = z.object({
  sellerId: z.string().uuid(),
  url: z.string().trim().min(1).max(2048).url(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isMain: z.boolean().optional().default(false),
});

type CreateProductImageBody = z.infer<typeof createProductImageBodySchema>;

const patchProductImageBodySchema = z
  .object({
    sellerId: z.string().uuid(),
    url: z.string().trim().min(1).max(2048).url().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isMain: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.url !== undefined ||
      data.sortOrder !== undefined ||
      data.isMain !== undefined,
    { message: "At least one field must be provided to update" },
  );

type PatchProductImageBody = z.infer<typeof patchProductImageBodySchema>;

const deleteProductImageBodySchema = z.object({
  sellerId: z.string().uuid(),
});

type DeleteProductImageBody = z.infer<typeof deleteProductImageBodySchema>;

const router = Router();

router.get(
  "/products/:productId/images/:imageId",
  validateParams(productImageIdParamsSchema),
  asyncHandler(async (_req, res) => {
    const { productId, imageId } = res.locals
      .validatedParams as ProductImageIdParams;
    const data = await getProductImage(productId, imageId);
    res.json({ data });
  }),
);

router.patch(
  "/products/:productId/images/:imageId",
  validateParams(productImageIdParamsSchema),
  validateBody(patchProductImageBodySchema),
  asyncHandler(async (req, res) => {
    const { productId, imageId } = res.locals
      .validatedParams as ProductImageIdParams;
    const body = req.body as PatchProductImageBody;
    const data = await updateProductImage({
      productId,
      imageId,
      sellerId: body.sellerId,
      url: body.url,
      sortOrder: body.sortOrder,
      isMain: body.isMain,
    });
    res.json({ data });
  }),
);

router.delete(
  "/products/:productId/images/:imageId",
  validateParams(productImageIdParamsSchema),
  validateBody(deleteProductImageBodySchema),
  asyncHandler(async (req, res) => {
    const { productId, imageId } = res.locals
      .validatedParams as ProductImageIdParams;
    const { sellerId } = req.body as DeleteProductImageBody;
    await deleteProductImage(productId, imageId, sellerId);
    res.status(204).end();
  }),
);

router.get(
  "/products/:productId/images",
  validateParams(productIdForImagesParamsSchema),
  asyncHandler(async (_req, res) => {
    const { productId } = res.locals
      .validatedParams as ProductIdForImagesParams;
    const data = await listProductImages(productId);
    res.json({ data });
  }),
);

router.post(
  "/products/:productId/images",
  validateParams(productIdForImagesParamsSchema),
  validateBody(createProductImageBodySchema),
  asyncHandler(async (req, res) => {
    const { productId } = res.locals
      .validatedParams as ProductIdForImagesParams;
    const body = req.body as CreateProductImageBody;
    const image = await createProductImage({
      productId,
      sellerId: body.sellerId,
      url: body.url,
      sortOrder: body.sortOrder,
      isMain: body.isMain,
    });
    res.status(201).json({ data: image });
  }),
);

export default router;
