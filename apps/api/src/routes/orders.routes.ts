import { OrderStatus } from "@marketplace/database";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  addOrderItem,
  createOrder,
  deleteOrder,
  deleteOrderItem,
  getOrderById,
  getOrderItem,
  listOrderItems,
  listOrders,
  patchOrder,
  patchOrderItem,
  patchOrderItemRating,
} from "../services/orders.service.js";

function prismaEnumFromJson<Enum extends Parameters<typeof z.nativeEnum>[0]>(
  enumeration: Enum,
) {
  return z.string().trim().toLowerCase().pipe(z.nativeEnum(enumeration));
}

function firstQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === "" ? undefined : s;
}

const orderIdParamsSchema = z.object({
  orderId: z.string().uuid(),
});

type OrderIdParams = z.infer<typeof orderIdParamsSchema>;

const orderItemParamsSchema = z.object({
  orderId: z.string().uuid(),
  itemId: z.string().uuid(),
});

type OrderItemParams = z.infer<typeof orderItemParamsSchema>;

const createOrderBodySchema = z.object({
  buyerId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
});

type CreateOrderBody = z.infer<typeof createOrderBodySchema>;

const listOrdersQuerySchema = z.object({
  buyerId: z.preprocess(
    (v) => firstQueryString(v),
    z.string().uuid().optional(),
  ),
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
    z.nativeEnum(OrderStatus).optional(),
  ),
});

type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

/** Optional buyer on query — same rule as `GET /orders/:orderId` for nested item reads. */
const optionalBuyerQuerySchema = z.object({
  buyerId: z.preprocess(
    (v) => firstQueryString(v),
    z.string().uuid().optional(),
  ),
});

type OptionalBuyerQuery = z.infer<typeof optionalBuyerQuerySchema>;

/** Single-order GET: optional caller identity until auth is wired. */
const getOrderQuerySchema = optionalBuyerQuerySchema;

type GetOrderQuery = z.infer<typeof getOrderQuerySchema>;

const patchOrderBodySchema = z.object({
  buyerId: z.string().uuid().optional(),
  status: prismaEnumFromJson(OrderStatus),
});

type PatchOrderBody = z.infer<typeof patchOrderBodySchema>;

const deleteOrderBodySchema = z.preprocess(
  (val) =>
    val === undefined || val === null || typeof val !== "object" ? {} : val,
  z.object({
    buyerId: z.string().uuid().optional(),
  }),
);

type DeleteOrderBody = z.infer<typeof deleteOrderBodySchema>;

const addOrderItemBodySchema = z.object({
  buyerId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

type AddOrderItemBody = z.infer<typeof addOrderItemBodySchema>;

const patchOrderItemBodySchema = z.object({
  buyerId: z.string().uuid().optional(),
  quantity: z.number().int().min(1),
});

type PatchOrderItemBody = z.infer<typeof patchOrderItemBodySchema>;

const patchOrderItemRatingBodySchema = z.object({
  buyerId: z.string().uuid().optional(),
  rating: z.preprocess(
    (v) => (typeof v === "string" ? Number(v) : v),
    z.number().min(0).max(5),
  ),
});

type PatchOrderItemRatingBody = z.infer<typeof patchOrderItemRatingBodySchema>;

const deleteOrderItemBodySchema = z.preprocess(
  (val) =>
    val === undefined || val === null || typeof val !== "object" ? {} : val,
  z.object({
    buyerId: z.string().uuid().optional(),
  }),
);

type DeleteOrderItemBody = z.infer<typeof deleteOrderItemBodySchema>;

const router = Router();

router.get(
  "/orders/:orderId/items/:itemId",
  validateParams(orderItemParamsSchema),
  validateQuery(optionalBuyerQuerySchema),
  asyncHandler(async (_req, res) => {
    const { orderId, itemId } = res.locals.validatedParams as OrderItemParams;
    const { buyerId } = res.locals.validatedQuery as OptionalBuyerQuery;
    const result = await getOrderItem(orderId, itemId, buyerId);
    res.json(result);
  }),
);

router.patch(
  "/orders/:orderId/items/:itemId/rating",
  validateParams(orderItemParamsSchema),
  validateBody(patchOrderItemRatingBodySchema),
  asyncHandler(async (req, res) => {
    const { orderId, itemId } = res.locals.validatedParams as OrderItemParams;
    const body = req.body as PatchOrderItemRatingBody;
    const result = await patchOrderItemRating({
      orderId,
      itemId,
      buyerId: body.buyerId,
      rating: body.rating,
    });
    res.json(result);
  }),
);

router.patch(
  "/orders/:orderId/items/:itemId",
  validateParams(orderItemParamsSchema),
  validateBody(patchOrderItemBodySchema),
  asyncHandler(async (req, res) => {
    const { orderId, itemId } = res.locals.validatedParams as OrderItemParams;
    const body = req.body as PatchOrderItemBody;
    const result = await patchOrderItem({
      orderId,
      itemId,
      buyerId: body.buyerId,
      quantity: body.quantity,
    });
    res.json(result);
  }),
);

router.delete(
  "/orders/:orderId/items/:itemId",
  validateParams(orderItemParamsSchema),
  validateBody(deleteOrderItemBodySchema),
  asyncHandler(async (req, res) => {
    const { orderId, itemId } = res.locals.validatedParams as OrderItemParams;
    const body = req.body as DeleteOrderItemBody;
    await deleteOrderItem({
      orderId,
      itemId,
      buyerId: body.buyerId,
    });
    res.status(204).end();
  }),
);

router.get(
  "/orders/:orderId/items",
  validateParams(orderIdParamsSchema),
  validateQuery(optionalBuyerQuerySchema),
  asyncHandler(async (_req, res) => {
    const { orderId } = res.locals.validatedParams as OrderIdParams;
    const { buyerId } = res.locals.validatedQuery as OptionalBuyerQuery;
    const result = await listOrderItems(orderId, buyerId);
    res.json(result);
  }),
);

router.post(
  "/orders/:orderId/items",
  validateParams(orderIdParamsSchema),
  validateBody(addOrderItemBodySchema),
  asyncHandler(async (req, res) => {
    const { orderId } = res.locals.validatedParams as OrderIdParams;
    const body = req.body as AddOrderItemBody;
    const result = await addOrderItem({
      orderId,
      buyerId: body.buyerId,
      productId: body.productId,
      quantity: body.quantity,
    });
    res.status(201).json(result);
  }),
);

router.get(
  "/orders/:orderId",
  validateParams(orderIdParamsSchema),
  validateQuery(getOrderQuerySchema),
  asyncHandler(async (_req, res) => {
    const { orderId } = res.locals.validatedParams as OrderIdParams;
    const { buyerId } = res.locals.validatedQuery as GetOrderQuery;
    const result = await getOrderById(orderId, buyerId);
    res.json(result);
  }),
);

router.patch(
  "/orders/:orderId",
  validateParams(orderIdParamsSchema),
  validateBody(patchOrderBodySchema),
  asyncHandler(async (req, res) => {
    const { orderId } = res.locals.validatedParams as OrderIdParams;
    const body = req.body as PatchOrderBody;
    const result = await patchOrder(orderId, body.buyerId, body.status);
    res.json(result);
  }),
);

router.delete(
  "/orders/:orderId",
  validateParams(orderIdParamsSchema),
  validateBody(deleteOrderBodySchema),
  asyncHandler(async (req, res) => {
    const { orderId } = res.locals.validatedParams as OrderIdParams;
    const body = req.body as DeleteOrderBody;
    await deleteOrder(orderId, body.buyerId);
    res.status(204).end();
  }),
);

router.get(
  "/orders",
  validateQuery(listOrdersQuerySchema),
  asyncHandler(async (_req, res) => {
    const query = res.locals.validatedQuery as ListOrdersQuery;
    const result = await listOrders(query);
    res.json(result);
  }),
);

router.post(
  "/orders",
  validateBody(createOrderBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateOrderBody;
    const result = await createOrder(body);
    res.status(201).json(result);
  }),
);

export default router;
