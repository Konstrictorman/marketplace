import { Prisma, prisma } from "@marketplace/database";
import { randomUUID } from "node:crypto";
import { HttpError } from "../lib/http-errors.js";

type ConversationBaseRow = {
  id: string;
  productId: string;
  createdAt: Date;
};

type ConversationParticipantRow = {
  conversation_id: string;
  user_id: string;
};

function mapConversation(
  row: ConversationBaseRow,
  participantsByConversationId: Map<string, string[]>,
) {
  return {
    id: row.id,
    productId: row.productId,
    createdAt: row.createdAt.toISOString(),
    participants: (participantsByConversationId.get(row.id) ?? []).map(
      (userId) => ({
        userId,
      }),
    ),
  };
}

async function getParticipantsByConversationIds(conversationIds: string[]) {
  if (conversationIds.length === 0) {
    return new Map<string, string[]>();
  }

  const rows = await prisma.$queryRaw<ConversationParticipantRow[]>(
    Prisma.sql`
      SELECT conversation_id, user_id
      FROM conversation_participants
      WHERE conversation_id IN (${Prisma.join(
        conversationIds.map((id) => Prisma.sql`${id}::uuid`),
      )})
    `,
  );

  const byConversationId = new Map<string, string[]>();
  for (const row of rows) {
    const bucket = byConversationId.get(row.conversation_id) ?? [];
    bucket.push(row.user_id);
    byConversationId.set(row.conversation_id, bucket);
  }

  return byConversationId;
}

async function assertConversationAccess(
  conversationId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      productId: true,
      createdAt: true,
    },
  });

  if (!conversation) {
    throw new HttpError(
      404,
      "Conversation not found",
      "conversation_not_found",
    );
  }

  const participantsByConversationId = await getParticipantsByConversationIds([
    conversation.id,
  ]);
  const participants = participantsByConversationId.get(conversation.id) ?? [];
  const isParticipant = participants.includes(userId);
  if (!isParticipant) {
    throw new HttpError(
      403,
      "You can only access conversations where you are a participant",
      "forbidden",
    );
  }

  return { conversation, participantsByConversationId };
}

export type CreateConversationInput = {
  productId: string;
  buyerId: string;
};

export async function createConversation(input: CreateConversationInput) {
  const [product, buyer] = await Promise.all([
    prisma.product.findUnique({
      where: { id: input.productId },
      select: { id: true, sellerId: true },
    }),
    prisma.user.findUnique({
      where: { id: input.buyerId },
      select: { id: true },
    }),
  ]);

  if (!product) {
    throw new HttpError(404, "Product not found", "product_not_found");
  }

  if (!buyer) {
    throw new HttpError(404, "Buyer not found", "buyer_not_found");
  }

  if (product.sellerId === input.buyerId) {
    throw new HttpError(
      409,
      "Buyer and seller must be different users",
      "invalid_participants",
    );
  }

  const participantIds = [input.buyerId, product.sellerId].sort();
  const [buyerRows, sellerRows] = await Promise.all([
    prisma.$queryRaw<Array<{ conversation_id: string }>>(
      Prisma.sql`
        SELECT conversation_id
        FROM conversation_participants
        WHERE user_id = ${input.buyerId}::uuid
      `,
    ),
    prisma.$queryRaw<Array<{ conversation_id: string }>>(
      Prisma.sql`
        SELECT conversation_id
        FROM conversation_participants
        WHERE user_id = ${product.sellerId}::uuid
      `,
    ),
  ]);

  const sellerConversationIds = new Set(
    sellerRows.map((r) => r.conversation_id),
  );
  const sharedConversationIds = buyerRows
    .map((r) => r.conversation_id)
    .filter((id) => sellerConversationIds.has(id));

  const existingBase =
    sharedConversationIds.length === 0
      ? null
      : await prisma.conversation.findFirst({
          where: {
            id: { in: sharedConversationIds },
            productId: input.productId,
          },
          select: {
            id: true,
            productId: true,
            createdAt: true,
          },
        });

  if (existingBase) {
    const participantsByConversationId = await getParticipantsByConversationIds(
      [existingBase.id],
    );
    const participants =
      participantsByConversationId.get(existingBase.id) ?? [];
    if (participants.length === 2) {
      return {
        conversation: mapConversation(
          existingBase,
          participantsByConversationId,
        ),
        created: false,
      };
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: { productId: input.productId },
      select: { id: true, productId: true, createdAt: true },
    });

    await Promise.all(
      participantIds.map((userId) =>
        tx.$executeRaw(
          Prisma.sql`
            INSERT INTO conversation_participants (id, conversation_id, user_id, created_at)
            VALUES (${randomUUID()}, ${conversation.id}, ${userId}, NOW())
          `,
        ),
      ),
    );

    return tx.conversation.findUniqueOrThrow({
      where: { id: conversation.id },
      select: {
        id: true,
        productId: true,
        createdAt: true,
      },
    });
  });

  const participantsByConversationId = await getParticipantsByConversationIds([
    created.id,
  ]);
  return {
    conversation: mapConversation(created, participantsByConversationId),
    created: true,
  };
}

export type ListConversationsParams = {
  userId: string;
  page: number;
  pageSize: number;
  productId?: string | undefined;
};

export async function listConversations(params: ListConversationsParams) {
  const participantRows = await prisma.$queryRaw<
    Array<{ conversation_id: string }>
  >(
    Prisma.sql`
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = ${params.userId}::uuid
    `,
  );

  const participantConversationIds = Array.from(
    new Set(participantRows.map((row) => row.conversation_id)),
  );

  if (participantConversationIds.length === 0) {
    return {
      data: [],
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const where = {
    id: { in: participantConversationIds },
    ...(params.productId !== undefined ? { productId: params.productId } : {}),
  };

  const skip = (params.page - 1) * params.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.conversation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: params.pageSize,
      select: {
        id: true,
        productId: true,
        createdAt: true,
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  const participantsByConversationId = await getParticipantsByConversationIds(
    rows.map((row) => row.id),
  );

  return {
    data: rows.map((row) => mapConversation(row, participantsByConversationId)),
    meta: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    },
  };
}

export async function getConversationById(id: string, userId: string) {
  const { conversation, participantsByConversationId } =
    await assertConversationAccess(id, userId);
  return mapConversation(conversation, participantsByConversationId);
}

export async function deleteConversation(id: string, userId: string) {
  await assertConversationAccess(id, userId);
  await prisma.conversation.delete({ where: { id } });
}
