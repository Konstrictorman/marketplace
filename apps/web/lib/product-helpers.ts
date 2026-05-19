import type { ProductCondition, ProductStatus } from "@/lib/api/products";

export const PRODUCT_PLACEHOLDER_IMAGE =
  "https://placehold.co/400x300?text=No+Image";

export function productImageUrl(mainImageUrl: string | null): string {
  return mainImageUrl ?? PRODUCT_PLACEHOLDER_IMAGE;
}

export function parseProductPrice(price: string): number {
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

const PRODUCT_RATING_MAX = 5;

export function parseProductRating(rating: string): number {
  const raw = Number(rating);
  if (!Number.isFinite(raw)) return 0;
  return Math.min(PRODUCT_RATING_MAX, Math.max(0, raw));
}

export function formatProductRating(rating: string): string {
  return parseProductRating(rating).toFixed(2);
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
