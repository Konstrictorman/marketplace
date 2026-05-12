import { Prisma, prisma } from "@marketplace/database";
import { HttpError } from "../lib/http-errors.js";

async function assertConversationExists(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conversation) {
    throw new HttpError(
      404,
      "Conversation not found",
      "conversation_not_found",
    );
  }
}

async function assertConversationParticipant(
  conversationId: string,
  userId: string,
) {
  await assertConversationExists(conversationId);

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
    select: { conversationId: true },
  });

  if (!participant) {
    throw new HttpError(
      403,
      "You can only access messages in conversations where you are a participant",
      "forbidden",
    );
  }
}

type MessageRow = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sent_at: Date;
  isRead: boolean;
};

function mapMessage(row: MessageRow) {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    content: row.content,
    sentAt: row.sent_at.toISOString(),
    isRead: row.isRead,
  };
}

export type ListMessagesParams = {
  conversationId: string;
  /** When set, only messages with this `senderId` (filter). */
  userId?: string | undefined;
  page: number;
  pageSize: number;
  sortOrder: "asc" | "desc";
};

export async function listMessages(params: ListMessagesParams) {
  await assertConversationExists(params.conversationId);

  const where: Prisma.MessageWhereInput = {
    conversationId: params.conversationId,
  };
  if (params.userId !== undefined) {
    where.senderId = params.userId;
  }

  const orderBy = { sent_at: params.sortOrder };
  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.message.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        sent_at: true,
        isRead: true,
      },
    }),
    prisma.message.count({ where }),
  ]);

  const totalPages =
    params.pageSize === 0 ? 0 : Math.ceil(total / params.pageSize);

  return {
    data: rows.map(mapMessage),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages,
    },
  };
}

export type CreateMessageInput = {
  conversationId: string;
  senderId: string;
  content: string;
};

export async function createMessage(input: CreateMessageInput) {
  await assertConversationParticipant(input.conversationId, input.senderId);

  const sender = await prisma.user.findUnique({
    where: { id: input.senderId },
    select: { id: true },
  });
  if (!sender) {
    throw new HttpError(404, "Sender not found", "user_not_found");
  }

  const row = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      senderId: input.senderId,
      content: input.content.trim(),
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      sent_at: true,
      isRead: true,
    },
  });

  return mapMessage(row);
}

export async function getMessageById(
  conversationId: string,
  messageId: string,
  userId?: string | undefined,
) {
  await assertConversationExists(conversationId);

  const row = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversationId,
      ...(userId !== undefined ? { senderId: userId } : {}),
    },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      sent_at: true,
      isRead: true,
    },
  });

  if (!row) {
    throw new HttpError(404, "Message not found", "message_not_found");
  }

  return mapMessage(row);
}

export type PatchMessageInput = {
  conversationId: string;
  messageId: string;
  /** When set, caller must be this participant (interim auth). */
  userId?: string | undefined;
  isRead: boolean;
};

/**
 * Updates `isRead`. When `userId` is provided, the user must be a conversation participant.
 */
export async function updateMessageReadState(input: PatchMessageInput) {
  if (input.userId !== undefined) {
    await assertConversationParticipant(input.conversationId, input.userId);
  } else {
    await assertConversationExists(input.conversationId);
  }

  const existing = await prisma.message.findFirst({
    where: { id: input.messageId, conversationId: input.conversationId },
    select: { id: true },
  });

  if (!existing) {
    throw new HttpError(404, "Message not found", "message_not_found");
  }

  const row = await prisma.message.update({
    where: { id: input.messageId },
    data: { isRead: input.isRead },
    select: {
      id: true,
      conversationId: true,
      senderId: true,
      content: true,
      sent_at: true,
      isRead: true,
    },
  });

  return mapMessage(row);
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
  userId: string,
) {
  await assertConversationExists(conversationId);

  const row = await prisma.message.findFirst({
    where: { id: messageId, conversationId },
    select: { id: true, senderId: true },
  });

  if (!row) {
    throw new HttpError(404, "Message not found", "message_not_found");
  }

  if (row.senderId !== userId) {
    throw new HttpError(
      403,
      "Only the message sender can delete this message",
      "forbidden",
    );
  }

  await prisma.message.delete({
    where: { id: messageId },
  });
}
