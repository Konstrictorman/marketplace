import type { ProductListItem } from "@/lib/api/products";

export type ProductType = ProductListItem;

export type CartItem = {
  product: ProductListItem;
  amount: number;
  selected: boolean;
};

export type CartContextType = {
  items: CartItem[];
  addToCart: (product: ProductListItem, amount: number) => void;
  removeFromCart: (productId: string) => void;
  updateAmount: (productId: string, amount: number) => void;
  toggleSelected: (productId: string) => void;
  toggleSelectAll: () => void;
  clearCart: () => void;
  totalItems: number;
};
