import type { ProductCondition, ProductStatus } from "@/lib/api/products";

export const PRODUCT_PLACEHOLDER_IMAGE =
  "https://placehold.co/400x300?text=No+image";

export function productImageUrl(mainImageUrl: string | null): string {
  return mainImageUrl ?? PRODUCT_PLACEHOLDER_IMAGE;
}

export function parseProductPrice(price: string): number {
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

/** Stored reputation is 0–10; UI shows a 0–5 calificación. */
const REPUTATION_STORED_MAX = 10;
const REPUTATION_DISPLAY_MAX = 5;

export function sellerReputationOutOf5(reputation: string): number {
  const raw = Number(reputation);
  if (!Number.isFinite(raw)) return 0;
  const scaled = (raw / REPUTATION_STORED_MAX) * REPUTATION_DISPLAY_MAX;
  return Math.min(REPUTATION_DISPLAY_MAX, Math.max(0, scaled));
}

export function formatSellerReputationOutOf5(reputation: string): string {
  return sellerReputationOutOf5(reputation).toFixed(2);
}

export function conditionLabel(condition: ProductCondition): string {
  switch (condition) {
    case "new":
      return "New";
    case "used":
      return "Used";
    case "refurbished":
      return "Refurbished";
  }
}

export function productStatusLabel(status: ProductStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "removed":
      return "Removed";
  }
}

export function productStatusChipColor(
  status: ProductStatus,
): "success" | "warning" | "error" {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "removed":
      return "error";
  }
}
