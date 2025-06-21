"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { Book, Cart, CartItem } from '@/types';
import { getBookById } from '@/services/api';

export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (bookId: string | number, quantity?: number) => Promise<void>;
  removeItem: (itemId: string | number) => Promise<void>;
  updateItemQuantity: (itemId: string | number, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>; // This will likely need a dedicated API endpoint or be complex client-side
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const LOCAL_STORAGE_KEY = 'localCart';
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCartFromStorage = (): Cart => {
    if (typeof window === 'undefined') return { items: [] };
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Cart;
      } catch (e) {
        console.warn('Failed to parse cart from storage', e);
      }
    }
    return { items: [] };
  };

  const saveCartToStorage = (cartToSave: Cart) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartToSave));
  };

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = loadCartFromStorage();
      setCart(stored);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (cart) saveCartToStorage(cart);
  }, [cart]);

  const addItem = async (bookId: string | number, quantity: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const book = await getBookById(bookId);
      setCart(prev => {
        const current = prev ?? { items: [] };
        const existing = current.items.find(i => String(i.libroId) === String(bookId));
        let newItems: CartItem[];
        if (existing) {
          newItems = current.items.map(i =>
            String(i.libroId) === String(bookId)
              ? { ...i, cantidad: i.cantidad + quantity }
              : i,
          );
        } else {
          const newItem: CartItem = {
            libroId: bookId,
            cantidad: quantity,
            precioUnitario: book.precio,
            libro: book,
          };
          newItems = [...current.items, newItem];
        }
        const newCart = { ...current, items: newItems };
        newCart.total = newItems.reduce((t, it) => t + it.precioUnitario * it.cantidad, 0);
        return newCart;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string | number) => {
    setCart(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter(i => String(i.libroId) !== String(itemId));
      const newCart = { ...prev, items: newItems };
      newCart.total = newItems.reduce((t, it) => t + it.precioUnitario * it.cantidad, 0);
      return newCart;
    });
  };

  const updateItemQuantity = async (itemId: string | number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setCart(prev => {
      if (!prev) return prev;
      const newItems = prev.items.map(i =>
        String(i.libroId) === String(itemId) ? { ...i, cantidad: newQuantity } : i,
      );
      const newCart = { ...prev, items: newItems };
      newCart.total = newItems.reduce((t, it) => t + it.precioUnitario * it.cantidad, 0);
      return newCart;
    });
  };

  const clearCart = async () => {
    setCart({ items: [], total: 0 });
  };

  const getCartTotal = () => {
    return cart?.items.reduce((total, item) => total + item.precioUnitario * item.cantidad, 0) ?? 0;
  };

  const getItemCount = () => {
    return cart?.items.reduce((count, item) => count + item.cantidad, 0) ?? 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        fetchCart,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Add this hook to export the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
