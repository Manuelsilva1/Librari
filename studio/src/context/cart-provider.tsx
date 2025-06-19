"use client"

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback, useContext } from 'react'; // Import useContext
import type { Book, Cart, CartItem as ApiCartItem, ApiResponseError } from '@/types'; // Renamed CartItem to ApiCartItem to avoid conflict
import { useAuth } from './auth-provider';
import { getCart, addItemToCart as apiAddItemToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from '@/services/api';

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
  const { token, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null); // Clear cart if not authenticated
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCart = await getCart();
      setCart(fetchedCart);
    } catch (err) {
      const apiError = err as ApiResponseError;
      console.error("Failed to fetch cart:", apiError);
      setError(apiError.message || "Failed to load cart.");
      // setCart(null); // Optionally clear cart on error or keep stale data
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, token]); // Re-fetch cart when token changes (login/logout)

  const addItem = async (bookId: string | number, quantity: number = 1) => {
    if (!isAuthenticated) {
      setError("User not authenticated. Cannot add item to cart.");
      // Or redirect to login, or handle local cart for guests
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Assuming bookId is what's needed by API, not the full Book object
      const updatedCart = await apiAddItemToCart({ libroId: bookId, cantidad: quantity });
      setCart(updatedCart);
    } catch (err) {
      const apiError = err as ApiResponseError;
      console.error("Failed to add item to cart:", apiError);
      setError(apiError.message || "Failed to add item.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string | number) => {
    if (!isAuthenticated) {
      setError("User not authenticated. Cannot remove item from cart.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiRemoveCartItem(itemId);
      // Option 1: Re-fetch the entire cart
      await fetchCart();
      // Option 2: If API returned updated cart (current service returns void)
      // setCart(updatedCartFromApi);
      // Option 3: Manipulate local state (less safe if other changes happen concurrently)
      // setCart(prevCart => ({
      //   ...prevCart!,
      //   items: prevCart!.items.filter(item => item.id !== itemId),
      //   // Recalculate total or wait for API to provide it
      // }));
    } catch (err) {
      const apiError = err as ApiResponseError;
      console.error("Failed to remove item from cart:", apiError);
      setError(apiError.message || "Failed to remove item.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string | number, newQuantity: number) => {
    if (!isAuthenticated) {
      setError("User not authenticated. Cannot update item quantity.");
      return;
    }
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const updatedCart = await apiUpdateCartItem(itemId, { cantidad: newQuantity });
      setCart(updatedCart);
    } catch (err) {
      const apiError = err as ApiResponseError;
      console.error("Failed to update item quantity:", apiError);
      setError(apiError.message || "Failed to update quantity.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setError("User not authenticated. Cannot clear cart.");
      return;
    }
    // This is tricky without a dedicated API endpoint.
    // Option 1: Iterate and remove all items (can be slow, many API calls)
    setIsLoading(true);
    setError(null);
    try {
      if (cart && cart.items.length > 0) {
        // This is a simplified approach. A robust solution might involve Promise.all
        // or a batch delete API if available.
        for (const item of cart.items) {
          if (item.id) { // Ensure item has an ID
             await apiRemoveCartItem(item.id);
          }
        }
      }
      await fetchCart(); // Re-fetch to confirm cart is empty or get latest state
    } catch (err) {
      const apiError = err as ApiResponseError;
      console.error("Failed to clear cart:", apiError);
      setError(apiError.message || "Failed to clear cart.");
    } finally {
      setIsLoading(false);
    }
    // Option 2: If no dedicated API, just clear local state and let it re-sync
    // setCart(null);
    // This is less ideal as the backend cart would persist.
  };

  const getCartTotal = () => {
    return cart?.total ?? cart?.items?.reduce((total, item) => total + (item.libro?.precio ?? 0) * item.cantidad, 0) ?? 0;
  };

  const getItemCount = () => {
    return cart?.items?.reduce((count, item) => count + item.cantidad, 0) ?? 0;
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
