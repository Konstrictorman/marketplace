export type productType = {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
    rating: number;
    condition: "new" | "used";
    image: string;
  };
  
  export type ProductCardProps = {
    product: productType;
  };

 export type CartItem = {
    product: productType;
    amount: number;
    selected: boolean;
  };
  
 export type CartContextType = {
    items: CartItem[];
    addToCart: (product: productType, amount: number) => void;
    removeFromCart: (productId: number) => void;
    updateAmount: (productId: number, amount: number) => void;
    toggleSelected: (productId: number) => void;
    toggleSelectAll: () => void;
    clearCart: () => void;
    totalItems: number;
  };