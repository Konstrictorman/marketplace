import { Prisma, prisma } from "@marketplace/database";
import { randomUUID } from "node:crypto";
import { HttpError } from "../lib/http-errors.js";

type ConversationParticipantRow = {
  participant_id: string;
  conversation_id: string;
  user_id: string;
  created_at: Date;
};

function mapParticipant(row: ConversationParticipantRow) {
  return {
    conversationId: row.conversation_id,
    userId: row.user_id,
    createdAt: row.created_at.toISOString(),
  };
}

async function ensureConversationExists(conversationId: string) {
  const row = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });
  if (!row) {
    throw new HttpError(
      404,
      "Conversation not found",
      "conversation_not_found",
    );
  }
}

async function isParticipant(conversationId: string, userId: string) {
  const rows = await prisma.$queryRaw<Array<{ exists: number }>>(
    Prisma.sql`
      SELECT 1 AS exists
      FROM public.conversation_participants
      WHERE conversation_id = ${conversationId}::uuid
        AND user_id = ${userId}::uuid
      LIMIT 1
    `,
  );
  return rows.length > 0;
}

async function ensureActorAccess(conversationId: string, actorUserId: string) {
  await ensureConversationExists(conversationId);
  const actorIsParticipant = await isParticipant(conversationId, actorUserId);
  if (!actorIsParticipant) {
    throw new HttpError(
      403,
      "You can only manage participants in conversations where you are a participant",
      "forbidden",
    );
  }
}

export async function listConversationParticipants(
  conversationId: string,
  userId?: string | undefined,
) {
  if (userId !== undefined) {
    await ensureActorAccess(conversationId, userId);
  } else {
    await ensureConversationExists(conversationId);
  }

  const rows = await prisma.$queryRaw<ConversationParticipantRow[]>(
    Prisma.sql`
      SELECT
        COALESCE(to_jsonb(cp)->>'id', cp.user_id::text) AS participant_id,
        cp.conversation_id,
        cp.user_id,
        cp.created_at
      FROM public.conversation_participants cp
      WHERE cp.conversation_id = ${conversationId}::uuid
      ORDER BY cp.created_at ASC, participant_id ASC
    `,
  );

  return rows.map(mapParticipant);
}

export type AddConversationParticipantInput = {
  conversationId: string;
  actorUserId: string;
  userId: string;
};

export async function addConversationParticipant(
  input: AddConversationParticipantInput,
) {
  await ensureActorAccess(input.conversationId, input.actorUserId);

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true },
  });
  if (!user) {
    throw new HttpError(404, "User not found", "user_not_found");
  }

  const existingRows = await prisma.$queryRaw<ConversationParticipantRow[]>(
    Prisma.sql`
      SELECT
        COALESCE(to_jsonb(cp)->>'id', cp.user_id::text) AS participant_id,
        cp.conversation_id,
        cp.user_id,
        cp.created_at
      FROM public.conversation_participants cp
      WHERE cp.conversation_id = ${input.conversationId}::uuid
        AND cp.user_id = ${input.userId}::uuid
      LIMIT 1
    `,
  );

  if (existingRows.length > 0) {
    return {
      participant: mapParticipant(existingRows[0]!),
      created: false,
    };
  }

  let insertedRows: ConversationParticipantRow[];
  try {
    insertedRows = await prisma.$queryRaw<ConversationParticipantRow[]>(
      Prisma.sql`
        INSERT INTO public.conversation_participants (conversation_id, user_id, created_at)
        VALUES (${input.conversationId}::uuid, ${input.userId}::uuid, NOW())
        RETURNING
          COALESCE(to_jsonb(conversation_participants)->>'id', user_id::text) AS participant_id,
          conversation_id,
          user_id,
          created_at
      `,
    );
  } catch {
    insertedRows = await prisma.$queryRaw<ConversationParticipantRow[]>(
      Prisma.sql`
        INSERT INTO public.conversation_participants (id, conversation_id, user_id, created_at)
        VALUES (${randomUUID()}, ${input.conversationId}::uuid, ${input.userId}::uuid, NOW())
        RETURNING
          COALESCE(to_jsonb(conversation_participants)->>'id', user_id::text) AS participant_id,
          conversation_id,
          user_id,
          created_at
      `,
    );
  }

  return {
    participant: mapParticipant(insertedRows[0]!),
    created: true,
  };
}

export async function getConversationParticipant(
  conversationId: string,
  participantId: string,
  userId?: string | undefined,
) {
  if (userId !== undefined) {
    await ensureActorAccess(conversationId, userId);
  } else {
    await ensureConversationExists(conversationId);
  }

  const rows = await prisma.$queryRaw<ConversationParticipantRow[]>(
    Prisma.sql`
      SELECT
        COALESCE(to_jsonb(cp)->>'id', cp.user_id::text) AS participant_id,
        cp.conversation_id,
        cp.user_id,
        cp.created_at
      FROM public.conversation_participants cp
      WHERE cp.conversation_id = ${conversationId}::uuid
        AND COALESCE(to_jsonb(cp)->>'id', cp.user_id::text) = ${participantId}
      LIMIT 1
    `,
  );

  if (rows.length === 0) {
    throw new HttpError(404, "Participant not found", "participant_not_found");
  }

  return mapParticipant(rows[0]!);
}

export async function deleteConversationParticipant(
  conversationId: string,
  participantId: string,
  actorUserId: string,
) {
  await ensureActorAccess(conversationId, actorUserId);

  const participantRows = await prisma.$queryRaw<ConversationParticipantRow[]>(
    Prisma.sql`
      SELECT
        COALESCE(to_jsonb(cp)->>'id', cp.user_id::text) AS participant_id,
        cp.conversation_id,
        cp.user_id,
        cp.created_at
      FROM public.conversation_participants cp
      WHERE cp.conversation_id = ${conversationId}::uuid
        AND COALESCE(to_jsonb(cp)->>'id', cp.user_id::text) = ${participantId}
      LIMIT 1
    `,
  );

  if (participantRows.length === 0) {
    throw new HttpError(404, "Participant not found", "participant_not_found");
  }

  const countRows = await prisma.$queryRaw<Array<{ total: number }>>(
    Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM public.conversation_participants
      WHERE conversation_id = ${conversationId}::uuid
    `,
  );

  const totalParticipants = countRows[0]?.total ?? 0;
  if (totalParticipants <= 2) {
    throw new HttpError(
      409,
      "Conversation must keep at least 2 participants",
      "min_participants_required",
    );
  }

  await prisma.$executeRaw(
    Prisma.sql`
      DELETE FROM public.conversation_participants cp
      WHERE cp.conversation_id = ${conversationId}::uuid
        AND COALESCE(to_jsonb(cp)->>'id', cp.user_id::text) = ${participantId}
    `,
  );
}
