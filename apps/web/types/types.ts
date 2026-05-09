export type productType = {
  /** Catalog UUID from API, or a stable string id for mock data. */
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  rating: number;
  condition: "new" | "used";
  image: string;
};

export type CartItem = {
  product: productType;
  amount: number;
  selected: boolean;
};

export type CartContextType = {
  items: CartItem[];
  addToCart: (product: productType, amount: number) => void;
  removeFromCart: (productId: string) => void;
  updateAmount: (productId: string, amount: number) => void;
  toggleSelected: (productId: string) => void;
  toggleSelectAll: () => void;
  clearCart: () => void;
  totalItems: number;
};
