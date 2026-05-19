import {
  patchOrderItemRating,
  type OrderItem,
  type PatchOrderItemRatingBody,
} from "@/lib/api/orders";

const ORDER_ITEM_RATING_MAX = 5;

/** Clamps a numeric rating to the API-allowed 0–5 range. */
export function clampOrderItemRating(rating: number): number {
  if (!Number.isFinite(rating)) return 0;
  return Math.min(ORDER_ITEM_RATING_MAX, Math.max(0, rating));
}

export type SetOrderItemProductRatingInput = {
  orderId: string;
  itemId: string;
  rating: number;
  /** When set, must match the order buyer (interim auth until JWT is enforced on the API). */
  buyerId?: string;
};

/**
 * Sets or updates the buyer’s product rating on an order line.
 * Calls `PATCH /api/orders/:orderId/items/:itemId/rating`.
 */
export async function setOrderItemProductRating(
  input: SetOrderItemProductRatingInput,
): Promise<OrderItem> {
  const body: PatchOrderItemRatingBody = {
    rating: clampOrderItemRating(input.rating),
    ...(input.buyerId !== undefined ? { buyerId: input.buyerId } : {}),
  };
  return patchOrderItemRating(input.orderId, input.itemId, body);
}
