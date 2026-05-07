import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { validateBody } from "../middleware/validate-body.js";
import { validateParams } from "../middleware/validate-params.js";
import { validateQuery } from "../middleware/validate-query.js";
import {
  addConversationParticipant,
  deleteConversationParticipant,
  getConversationParticipant,
  listConversationParticipants,
} from "../services/conversation-participants.service.js";

const conversationParticipantsParamsSchema = z.object({
  conversationId: z.string().uuid(),
});

type ConversationParticipantsParams = z.infer<
  typeof conversationParticipantsParamsSchema
>;

const conversationParticipantParamsSchema = z.object({
  conversationId: z.string().uuid(),
  participantId: z.string().uuid(),
});

type ConversationParticipantParams = z.infer<
  typeof conversationParticipantParamsSchema
>;

const listParticipantsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
});

type ListParticipantsQuery = z.infer<typeof listParticipantsQuerySchema>;

const participantAccessQuerySchema = z.object({
  userId: z.string().uuid().optional(),
});

type ParticipantAccessQuery = z.infer<typeof participantAccessQuerySchema>;

const addParticipantBodySchema = z.object({
  actorUserId: z.string().uuid(),
  userId: z.string().uuid(),
});

type AddParticipantBody = z.infer<typeof addParticipantBodySchema>;

const deleteParticipantBodySchema = z.object({
  actorUserId: z.string().uuid(),
});

type DeleteParticipantBody = z.infer<typeof deleteParticipantBodySchema>;

const router = Router();

router.get(
  "/conversations/:conversationId/participants",
  validateParams(conversationParticipantsParamsSchema),
  validateQuery(listParticipantsQuerySchema),
  asyncHandler(async (_req, res) => {
    const { conversationId } = res.locals
      .validatedParams as ConversationParticipantsParams;
    const { userId } = res.locals.validatedQuery as ListParticipantsQuery;
    const data = await listConversationParticipants(conversationId, userId);
    res.json({ data });
  }),
);

router.post(
  "/conversations/:conversationId/participants",
  validateParams(conversationParticipantsParamsSchema),
  validateBody(addParticipantBodySchema),
  asyncHandler(async (req, res) => {
    const { conversationId } = res.locals
      .validatedParams as ConversationParticipantsParams;
    const body = req.body as AddParticipantBody;
    const { participant, created } = await addConversationParticipant({
      conversationId,
      actorUserId: body.actorUserId,
      userId: body.userId,
    });
    res.status(created ? 201 : 200).json({ data: participant });
  }),
);

router.get(
  "/conversations/:conversationId/participants/:participantId",
  validateParams(conversationParticipantParamsSchema),
  validateQuery(participantAccessQuerySchema),
  asyncHandler(async (_req, res) => {
    const { conversationId, participantId } = res.locals
      .validatedParams as ConversationParticipantParams;
    const { userId } = res.locals.validatedQuery as ParticipantAccessQuery;
    const data = await getConversationParticipant(
      conversationId,
      participantId,
      userId,
    );
    res.json({ data });
  }),
);

router.delete(
  "/conversations/:conversationId/participants/:participantId",
  validateParams(conversationParticipantParamsSchema),
  validateBody(deleteParticipantBodySchema),
  asyncHandler(async (req, res) => {
    const { conversationId, participantId } = res.locals
      .validatedParams as ConversationParticipantParams;
    const { actorUserId } = req.body as DeleteParticipantBody;
    await deleteConversationParticipant(
      conversationId,
      participantId,
      actorUserId,
    );
    res.status(204).end();
  }),
);

export default router;
