import { apiClient } from "@/lib/api/client";
import type { PaginationMeta } from "@/lib/api/products";

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
};

export type ListMessagesQuery = {
  userId?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: "asc" | "desc";
};

export type CreateMessageBody = {
  senderId: string;
  content: string;
};

export type PatchMessageBody = {
  userId?: string;
  isRead: boolean;
};

export type DeleteMessageBody = {
  userId: string;
};

export async function listMessages(
  conversationId: string,
  query: ListMessagesQuery = {},
) {
  const { data } = await apiClient.get<{
    data: Message[];
    meta: PaginationMeta;
  }>(`/api/conversations/${conversationId}/messages`, { params: query });
  return data;
}

export async function createMessage(
  conversationId: string,
  body: CreateMessageBody,
) {
  const { data } = await apiClient.post<{ data: Message }>(
    `/api/conversations/${conversationId}/messages`,
    body,
  );
  return data;
}

export async function getMessage(
  conversationId: string,
  messageId: string,
  query: { userId?: string } = {},
) {
  const { data } = await apiClient.get<{ data: Message }>(
    `/api/conversations/${conversationId}/messages/${messageId}`,
    { params: query },
  );
  return data;
}

export async function patchMessage(
  conversationId: string,
  messageId: string,
  body: PatchMessageBody,
) {
  const { data } = await apiClient.patch<{ data: Message }>(
    `/api/conversations/${conversationId}/messages/${messageId}`,
    body,
  );
  return data;
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
  body: DeleteMessageBody,
) {
  await apiClient.delete(
    `/api/conversations/${conversationId}/messages/${messageId}`,
    { data: body },
  );
}
