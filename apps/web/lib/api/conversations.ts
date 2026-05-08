import { apiClient } from "@/lib/api/client";
import type { PaginationMeta } from "@/lib/api/products";

/**
 * The backend currently has no `/users` REST router.
 * User-scoped messaging endpoints live under `/conversations`.
 */
export type ConversationParticipant = {
  userId: string;
};

export type Conversation = {
  id: string;
  productId: string | null;
  createdAt: string;
  participants: ConversationParticipant[];
};

export type ListConversationsQuery = {
  userId: string;
  page?: number;
  pageSize?: number;
  productId?: string;
};

export type CreateConversationBody = {
  productId: string;
  buyerId: string;
};

export type DeleteConversationBody = {
  userId: string;
};

export type GetConversationQuery = {
  userId: string;
};

export type ConversationParticipantDetail = {
  conversationId: string;
  userId: string;
  createdAt: string;
};

export type ListParticipantsQuery = {
  userId?: string;
};

export type AddParticipantBody = {
  actorUserId: string;
  userId: string;
};

export type DeleteParticipantBody = {
  actorUserId: string;
};

export async function createConversation(body: CreateConversationBody) {
  const { data } = await apiClient.post<{ data: Conversation }>(
    "/api/conversations",
    body,
  );
  return data;
}

export async function listConversations(query: ListConversationsQuery) {
  const { data } = await apiClient.get<{
    data: Conversation[];
    meta: PaginationMeta;
  }>("/api/conversations", { params: query });
  return data;
}

export async function getConversationById(
  id: string,
  query: GetConversationQuery,
) {
  const { data } = await apiClient.get<{ data: Conversation }>(
    `/api/conversations/${id}`,
    { params: query },
  );
  return data;
}

export async function deleteConversation(
  id: string,
  body: DeleteConversationBody,
) {
  await apiClient.delete(`/api/conversations/${id}`, { data: body });
}

export async function listConversationParticipants(
  conversationId: string,
  query: ListParticipantsQuery = {},
) {
  const { data } = await apiClient.get<{
    data: ConversationParticipantDetail[];
  }>(`/api/conversations/${conversationId}/participants`, { params: query });
  return data;
}

export async function addConversationParticipant(
  conversationId: string,
  body: AddParticipantBody,
) {
  const { data } = await apiClient.post<{
    data: ConversationParticipantDetail;
  }>(`/api/conversations/${conversationId}/participants`, body);
  return data;
}

export async function getConversationParticipant(
  conversationId: string,
  participantId: string,
  query: ListParticipantsQuery = {},
) {
  const { data } = await apiClient.get<{ data: ConversationParticipantDetail }>(
    `/api/conversations/${conversationId}/participants/${participantId}`,
    { params: query },
  );
  return data;
}

export async function deleteConversationParticipant(
  conversationId: string,
  participantId: string,
  body: DeleteParticipantBody,
) {
  await apiClient.delete(
    `/api/conversations/${conversationId}/participants/${participantId}`,
    { data: body },
  );
}
