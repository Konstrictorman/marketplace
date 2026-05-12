import type { ProductListItem } from "@/lib/api/products";
import type { productType } from "@/types/types";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/280x180/1837A0/FEFEFE?text=Product";

/** Maps catalog list rows into the shape expected by {@link ProductCard}. */
export function mapProductListItemToCardProduct(
  p: ProductListItem,
): productType {
  const priceNum = Number.parseFloat(p.price);
  const condition: productType["condition"] =
    p.condition === "refurbished" ? "used" : p.condition;

  return {
    id: p.id,
    name: p.title,
    price: Number.isFinite(priceNum) ? priceNum : 0,
    description: [
      `${p.condition} · ${p.inventory} in stock`,
      `Status: ${p.status}`,
      `Product ID: ${p.id}`,
    ].join("\n"),
    stock: p.inventory,
    rating: 0,
    condition,
    image: p.mainImageUrl ?? PLACEHOLDER_IMAGE,
  };
}
