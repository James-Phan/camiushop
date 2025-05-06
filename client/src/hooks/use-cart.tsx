import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItemWithProduct } from "@/lib/types";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./use-auth";

type CartContextType = {
  cartItems: CartItemWithProduct[] | null;
  isLoading: boolean;
  error: Error | null;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number, quantity: number, variant?: string) => void;
  updateCartItem: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
  isUpdating: boolean;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    data: cartItems,
    error,
    isLoading,
    refetch,
  } = useQuery<CartItemWithProduct[], Error>({
    queryKey: ["/api/cart"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      variant,
    }: {
      productId: number;
      quantity: number;
      variant?: string;
    }) => {
      if (!user) {
        throw new Error("You need to log in to add items to your cart");
      }
      
      const res = await apiRequest("POST", "/api/cart", {
        productId,
        quantity,
        variant,
      });
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async ({
      id,
      quantity,
    }: {
      id: number;
      quantity: number;
    }) => {
      if (!user) {
        throw new Error("You need to log in to update items in your cart");
      }
      
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!user) {
        throw new Error("You need to log in to remove items from your cart");
      }
      
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You need to log in to clear your cart");
      }
      
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate total items and price
  const itemCount = cartItems?.reduce((count, item) => count + item.quantity, 0) || 0;
  const cartTotal =
    cartItems?.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + price * item.quantity;
    }, 0) || 0;

  const isUpdating =
    addToCartMutation.isPending ||
    updateCartItemMutation.isPending ||
    removeFromCartMutation.isPending ||
    clearCartMutation.isPending;

  return (
    <CartContext.Provider
      value={{
        cartItems: cartItems || null,
        isLoading,
        error,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart: (productId, quantity, variant) => {
          if (!user) {
            toast({
              title: "Please log in",
              description: "You need to log in to add items to your cart.",
              variant: "destructive",
            });
            return;
          }
          addToCartMutation.mutate({ productId, quantity, variant });
          setIsCartOpen(true);
        },
        updateCartItem: (id, quantity) => {
          updateCartItemMutation.mutate({ id, quantity });
        },
        removeFromCart: (id) => {
          removeFromCartMutation.mutate(id);
        },
        clearCart: () => {
          clearCartMutation.mutate();
        },
        itemCount,
        cartTotal,
        isUpdating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
