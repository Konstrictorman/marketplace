import { apiClient } from "@/lib/api/client";
import type { PaginationMeta } from "@/lib/api/products";

export type OrderStatus =
  | "pending"
  | "cancelled"
  | "paid"
  | "shipped"
  | "delivered";

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  createdAt: string;
};

export type OrderSummary = {
  id: string;
  buyerId: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetail = OrderSummary & {
  items: OrderItem[];
};

export type ListOrdersQuery = {
  buyerId?: string;
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
};

export type CreateOrderBody = {
  buyerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type PatchOrderBody = {
  buyerId?: string;
  status: OrderStatus;
};

export type DeleteOrderBody = {
  buyerId?: string;
};

export type OptionalBuyerQuery = {
  buyerId?: string;
};

export type AddOrderItemBody = {
  buyerId?: string;
  productId: string;
  quantity: number;
};

export type PatchOrderItemBody = {
  buyerId?: string;
  quantity: number;
};

export type DeleteOrderItemBody = {
  buyerId?: string;
};

export async function listOrders(query: ListOrdersQuery = {}) {
  const { data } = await apiClient.get<{
    data: OrderSummary[];
    meta: PaginationMeta;
  }>("/api/orders", { params: query });
  return data;
}

export async function createOrder(body: CreateOrderBody) {
  const { data } = await apiClient.post<{ data: OrderDetail }>(
    "/api/orders",
    body,
  );
  return data;
}

export async function getOrderById(
  orderId: string,
  query: OptionalBuyerQuery = {},
) {
  const { data } = await apiClient.get<{ data: OrderDetail }>(
    `/api/orders/${orderId}`,
    {
      params: query,
    },
  );
  return data;
}

export async function patchOrder(orderId: string, body: PatchOrderBody) {
  const { data } = await apiClient.patch<{ data: OrderDetail }>(
    `/api/orders/${orderId}`,
    body,
  );
  return data;
}

export async function deleteOrder(orderId: string, body: DeleteOrderBody = {}) {
  await apiClient.delete(`/api/orders/${orderId}`, { data: body });
}

export async function listOrderItems(
  orderId: string,
  query: OptionalBuyerQuery = {},
) {
  const { data } = await apiClient.get<{ data: OrderItem[] }>(
    `/api/orders/${orderId}/items`,
    { params: query },
  );
  return data;
}

export async function addOrderItem(orderId: string, body: AddOrderItemBody) {
  const { data } = await apiClient.post<{ data: OrderDetail }>(
    `/api/orders/${orderId}/items`,
    body,
  );
  return data;
}

export async function getOrderItem(
  orderId: string,
  itemId: string,
  query: OptionalBuyerQuery = {},
) {
  const { data } = await apiClient.get<{ data: OrderItem }>(
    `/api/orders/${orderId}/items/${itemId}`,
    { params: query },
  );
  return data;
}

export async function patchOrderItem(
  orderId: string,
  itemId: string,
  body: PatchOrderItemBody,
) {
  const { data } = await apiClient.patch<{ data: OrderDetail }>(
    `/api/orders/${orderId}/items/${itemId}`,
    body,
  );
  return data;
}

export async function deleteOrderItem(
  orderId: string,
  itemId: string,
  body: DeleteOrderItemBody = {},
) {
  await apiClient.delete(`/api/orders/${orderId}/items/${itemId}`, {
    data: body,
  });
}
