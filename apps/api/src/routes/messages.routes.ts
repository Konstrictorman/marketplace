import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  createMessage,
  deleteMessage,
  getMessageById,
  listMessages,
  updateMessageReadState,
} from "../services/messages.service.js";

const conversationMessagesParamsSchema = z.object({
  conversationId: z.string().uuid(),
});

type ConversationMessagesParams = z.infer<
  typeof conversationMessagesParamsSchema
>;

const conversationMessageParamsSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
});

type ConversationMessageParams = z.infer<
  typeof conversationMessageParamsSchema
>;

const listMessagesQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;

const getMessageQuerySchema = z.object({
  userId: z.string().uuid().optional(),
});

type GetMessageQuery = z.infer<typeof getMessageQuerySchema>;

const createMessageBodySchema = z.object({
  senderId: z.string().uuid(),
  content: z
    .string()
    .trim()
    .min(1, "Message content cannot be empty")
    .max(20_000),
});

type CreateMessageBody = z.infer<typeof createMessageBodySchema>;

const patchMessageBodySchema = z.object({
  userId: z.string().uuid().optional(),
  isRead: z.boolean(),
});

type PatchMessageBody = z.infer<typeof patchMessageBodySchema>;

const deleteMessageBodySchema = z.object({
  userId: z.string().uuid(),
});

type DeleteMessageBody = z.infer<typeof deleteMessageBodySchema>;

const router = Router();

router.get(
  "/conversations/:conversationId/messages",
  validateParams(conversationMessagesParamsSchema),
  validateQuery(listMessagesQuerySchema),
  asyncHandler(async (_req, res) => {
    const { conversationId } = res.locals
      .validatedParams as ConversationMessagesParams;
    const query = res.locals.validatedQuery as ListMessagesQuery;
    const result = await listMessages({
      conversationId,
      userId: query.userId,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
    res.json(result);
  }),
);

router.post(
  "/conversations/:conversationId/messages",
  validateParams(conversationMessagesParamsSchema),
  validateBody(createMessageBodySchema),
  asyncHandler(async (req, res) => {
    const { conversationId } = res.locals
      .validatedParams as ConversationMessagesParams;
    const body = req.body as CreateMessageBody;
    const data = await createMessage({
      conversationId,
      senderId: body.senderId,
      content: body.content,
    });
    res.status(201).json({ data });
  }),
);

router.get(
  "/conversations/:conversationId/messages/:messageId",
  validateParams(conversationMessageParamsSchema),
  validateQuery(getMessageQuerySchema),
  asyncHandler(async (_req, res) => {
    const { conversationId, messageId } = res.locals
      .validatedParams as ConversationMessageParams;
    const { userId } = res.locals.validatedQuery as GetMessageQuery;
    const data = await getMessageById(conversationId, messageId, userId);
    res.json({ data });
  }),
);

router.patch(
  "/conversations/:conversationId/messages/:messageId",
  validateParams(conversationMessageParamsSchema),
  validateBody(patchMessageBodySchema),
  asyncHandler(async (req, res) => {
    const { conversationId, messageId } = res.locals
      .validatedParams as ConversationMessageParams;
    const body = req.body as PatchMessageBody;
    const data = await updateMessageReadState({
      conversationId,
      messageId,
      userId: body.userId,
      isRead: body.isRead,
    });
    res.json({ data });
  }),
);

router.delete(
  "/conversations/:conversationId/messages/:messageId",
  validateParams(conversationMessageParamsSchema),
  validateBody(deleteMessageBodySchema),
  asyncHandler(async (req, res) => {
    const { conversationId, messageId } = res.locals
      .validatedParams as ConversationMessageParams;
    const { userId } = req.body as DeleteMessageBody;
    await deleteMessage(conversationId, messageId, userId);
    res.status(204).end();
  }),
);

export default router;
