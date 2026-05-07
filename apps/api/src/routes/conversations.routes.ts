import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  createConversation,
  deleteConversation,
  getConversationById,
  listConversations,
} from "../services/conversations.service.js";

const conversationIdParamsSchema = z.object({
  id: z.string().uuid(),
});

type ConversationIdParams = z.infer<typeof conversationIdParamsSchema>;

const createConversationBodySchema = z.object({
  productId: z.string().uuid(),
  buyerId: z.string().uuid(),
});

type CreateConversationBody = z.infer<typeof createConversationBodySchema>;

const listConversationsQuerySchema = z.object({
  userId: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
});

type ListConversationsQuery = z.infer<typeof listConversationsQuerySchema>;

const getConversationQuerySchema = z.object({
  userId: z.string().uuid(),
});

type GetConversationQuery = z.infer<typeof getConversationQuerySchema>;

const deleteConversationBodySchema = z.object({
  userId: z.string().uuid(),
});

type DeleteConversationBody = z.infer<typeof deleteConversationBodySchema>;

const router = Router();

router.post(
  "/conversations",
  validateBody(createConversationBodySchema),
  asyncHandler(async (req, res) => {
    const body = req.body as CreateConversationBody;
    const { conversation, created } = await createConversation({
      productId: body.productId,
      buyerId: body.buyerId,
    });
    res.status(created ? 201 : 200).json({ data: conversation });
  }),
);

router.get(
  "/conversations",
  validateQuery(listConversationsQuerySchema),
  asyncHandler(async (_req, res) => {
    const query = res.locals.validatedQuery as ListConversationsQuery;
    const data = await listConversations({
      userId: query.userId,
      page: query.page,
      pageSize: query.pageSize,
      productId: query.productId,
    });
    res.json(data);
  }),
);

router.get(
  "/conversations/:id",
  validateParams(conversationIdParamsSchema),
  validateQuery(getConversationQuerySchema),
  asyncHandler(async (_req, res) => {
    const { id } = res.locals.validatedParams as ConversationIdParams;
    const { userId } = res.locals.validatedQuery as GetConversationQuery;
    const data = await getConversationById(id, userId);
    res.json({ data });
  }),
);

router.delete(
  "/conversations/:id",
  validateParams(conversationIdParamsSchema),
  validateBody(deleteConversationBodySchema),
  asyncHandler(async (req, res) => {
    const { id } = res.locals.validatedParams as ConversationIdParams;
    const { userId } = req.body as DeleteConversationBody;
    await deleteConversation(id, userId);
    res.status(204).end();
  }),
);

export default router;
