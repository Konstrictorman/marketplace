"use client";
import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { CartItem, productType } from "@/app/types/types";
import { CartContextType } from "@/app/types/types";


const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: productType, amount: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // If already in cart, just update amount
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, amount: item.amount + amount }
            : item
        );
      }
      return [...prev, { product, amount, selected: true }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateAmount = (productId: number, amount: number) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, amount } : item
      )
    );
  };

  const toggleSelected = (productId: number) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = items.every(item => item.selected);
    setItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.amount, 0);

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateAmount,
    toggleSelected,
    toggleSelectAll,
    clearCart,
    totalItems,
  }), [items, totalItems]);
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};