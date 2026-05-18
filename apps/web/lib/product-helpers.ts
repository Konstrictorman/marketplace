import type { ProductCondition } from "@/lib/api/products";

export const PRODUCT_PLACEHOLDER_IMAGE =
  "https://placehold.co/400x300?text=No+image";

export function productImageUrl(mainImageUrl: string | null): string {
  return mainImageUrl ?? PRODUCT_PLACEHOLDER_IMAGE;
}

export function parseProductPrice(price: string): number {
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
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
