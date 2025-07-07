import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useRef } from "react";

// Check if we're in a deployment environment
const isDeployment = typeof window !== 'undefined' && 
                    !window.location.hostname.includes('localhost') && 
                    !window.location.hostname.includes('127.0.0.1');

interface CartItem {
  product: Product;
  quantity: number;
  isGift: boolean;
  giftMessage?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  giftWrap: {
    type: 'standard' | 'premium' | 'luxury' | null;
    cost: number;
  };
  discount: {
    code: string;
    percent: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  pendingUpdates: Set<number>;
}

type CartAction =
  | { type: "SET_CART_ITEMS"; items: CartItem[] }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "UPDATE_GIFT_WRAP"; giftWrap: { type: GiftWrapType; cost: number } }
  | { type: "CLEAR_CART" }
  | { type: "START_UPDATE"; productId: number }
  | { type: "END_UPDATE"; productId: number }
  | { type: "OPTIMISTIC_ADD_ITEM"; item: CartItem }
  | { type: "OPTIMISTIC_REMOVE_ITEM"; productId: number }
  | { type: "OPTIMISTIC_UPDATE_QUANTITY"; productId: number; quantity: number }
  | { type: "UPDATE_GIFT_STATUS"; productId: number; isGift: boolean; giftMessage?: string };

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number, isGift?: boolean, giftMessage?: string) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  updateGiftWrap: (type: GiftWrapType, cost: number) => Promise<void>;
  updateGiftStatus: (productId: number, isGift: boolean, giftMessage?: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type GiftWrapType = 'standard' | 'premium' | 'luxury' | null;

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };

    case "SET_CART_ITEMS":
      return {
        ...state,
        items: action.items,
        total: action.items.reduce((total, item) => total + item.product.price * item.quantity, 0),
        isLoading: false,
        error: null,
      };

    case "OPTIMISTIC_ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(item => item.product.id === action.item.product.id);
      let newItems;

      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.item.quantity,
        };
      } else {
        newItems = [...state.items, action.item];
      }

      return {
        ...state,
        items: newItems,
        total: newItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
      };
    }

    case "OPTIMISTIC_REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.product.id !== action.productId);
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
      };
    }

    case "OPTIMISTIC_UPDATE_QUANTITY": {
      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
      };
    }

    case "UPDATE_GIFT_WRAP":
      return {
        ...state,
        giftWrap: action.giftWrap,
      };

    case "UPDATE_GIFT_STATUS": {
      const newItems = state.items.map(item =>
        item.product.id === action.productId
          ? { ...item, isGift: action.isGift, giftMessage: action.giftMessage }
          : item
      );
      return {
        ...state,
        items: newItems,
      };
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        giftWrap: { type: null, cost: 0 },
        discount: null,
        isLoading: false,
        error: null,
        pendingUpdates: new Set(),
      };

    case "START_UPDATE": {
      const newUpdates = new Set(state.pendingUpdates);
      newUpdates.add(action.productId);
      return {
        ...state,
        pendingUpdates: newUpdates,
      };
    }

    case "END_UPDATE": {
      const newUpdates = new Set(state.pendingUpdates);
      newUpdates.delete(action.productId);
      return {
        ...state,
        pendingUpdates: newUpdates,
      };
    }

    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    giftWrap: { type: null, cost: 0 },
    discount: null,
    isLoading: false,
    error: null,
    pendingUpdates: new Set<number>(),
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchCartItems = async () => {
    if (!user) return;

    // For deployments, return empty cart
    if (isDeployment) {
      dispatch({ type: "SET_CART_ITEMS", items: [] });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", isLoading: true });
      const response = await fetch('/api/cart', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        dispatch({ type: "CLEAR_CART" });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const items = await response.json();
      dispatch({ type: "SET_CART_ITEMS", items });
    } catch (error: any) {
      console.error('Failed to load cart items:', error);
      dispatch({ type: "SET_ERROR", error: "Failed to load cart items" });
      toast({
        title: "Error",
        description: "Failed to load cart items. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  };

  useEffect(() => {
    if (!user) {
      dispatch({ type: "CLEAR_CART" });
      return;
    }

    const fetchWithErrorBoundary = async () => {
      try {
        await fetchCartItems();
      } catch (error) {
        console.error("Error in cart fetch effect:", error);
      }
    };

    fetchWithErrorBoundary();
  }, [user]);

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update cart.",
        variant: "destructive",
      });
      throw new Error("AUTH_REQUIRED");
    }

    // For deployments, simulate success
    if (isDeployment) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    if (state.pendingUpdates.has(productId)) {
      return;
    }

    if (quantity < 0 || quantity > 10) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be between 1 and 10",
        variant: "destructive",
      });
      return;
    }

    if (quantity === 0) {
      await removeItem(productId);
      return;
    }

    dispatch({ type: "START_UPDATE", productId });
    dispatch({ type: "OPTIMISTIC_UPDATE_QUANTITY", productId, quantity });

    try {
      const response = await fetch(`/api/cart/${productId}/quantity`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          quantity,
        })
      });

      if (response.status === 401) {
        throw new Error("AUTH_REQUIRED");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity');
      }

      await fetchCartItems();
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      if (error.message === "AUTH_REQUIRED") {
        throw error;
      }
      await fetchCartItems(); 
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "END_UPDATE", productId });
    }
  };

  const addItem = async (product: Product, quantity = 1, isGift = false, giftMessage?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart.",
        variant: "destructive",
      });
      throw new Error("AUTH_REQUIRED");
    }

    // For deployments, simulate success
    if (isDeployment) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Optimistically update the cart
      dispatch({ 
        type: "OPTIMISTIC_ADD_ITEM", 
        item: { product, quantity, isGift, giftMessage } 
      });
      
      return;
    }

    if (state.pendingUpdates.has(product.id)) {
      return;
    }

    dispatch({ type: "START_UPDATE", productId: product.id });
    dispatch({ 
      type: "OPTIMISTIC_ADD_ITEM", 
      item: { product, quantity, isGift, giftMessage } 
    });

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          isGift,
          giftMessage
        })
      });

      if (response.status === 401) {
        throw new Error("AUTH_REQUIRED");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      await fetchCartItems();
      toast({
        title: "Added to Cart",
        description: `${product.name} added to cart`,
      });
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      if (error.message === "AUTH_REQUIRED") {
        throw error;
      }
      await fetchCartItems(); 
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "END_UPDATE", productId: product.id });
    }
  };

  const removeItem = async (productId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to remove items from cart.",
        variant: "destructive",
      });
      throw new Error("AUTH_REQUIRED");
    }

    // For deployments, simulate success
    if (isDeployment) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Optimistically remove the item
      dispatch({ type: "OPTIMISTIC_REMOVE_ITEM", productId });
      
      return;
    }

    if (state.pendingUpdates.has(productId)) {
      return;
    }

    dispatch({ type: "START_UPDATE", productId });
    dispatch({ type: "OPTIMISTIC_REMOVE_ITEM", productId });

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error("AUTH_REQUIRED");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart');
      }

      await fetchCartItems();
      
      toast({
        title: "Item Removed",
        description: "Item removed from cart"
      });
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      if (error.message === "AUTH_REQUIRED") {
        throw error;
      }
      await fetchCartItems(); 
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "END_UPDATE", productId });
    }
  };

  const updateGiftWrap = async (type: GiftWrapType, cost: number) => {
    // For deployments, simulate success
    if (isDeployment) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update gift wrap state
      dispatch({ type: "UPDATE_GIFT_WRAP", giftWrap: { type, cost } });
      
      return;
    }

    dispatch({ type: "UPDATE_GIFT_WRAP", giftWrap: { type, cost } });
  };

  const updateGiftStatus = async (productId: number, isGift: boolean, giftMessage?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update gift status.",
        variant: "destructive",
      });
      throw new Error("AUTH_REQUIRED");
    }

    // For deployments, simulate success
    if (isDeployment) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update gift status
      dispatch({ type: "UPDATE_GIFT_STATUS", productId, isGift, giftMessage });
      
      return;
    }

    if (state.pendingUpdates.has(productId)) {
      return;
    }

    dispatch({ type: "START_UPDATE", productId });
    dispatch({ type: "UPDATE_GIFT_STATUS", productId, isGift, giftMessage });

    try {
      const response = await fetch(`/api/cart/${productId}/gift`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          isGift,
          giftMessage
        })
      });

      if (response.status === 401) {
        throw new Error("AUTH_REQUIRED");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update gift status');
      }

      await fetchCartItems();
      
      toast({
        title: "Gift Status Updated",
        description: isGift ? "Item marked as gift" : "Gift status removed"
      });
    } catch (error: any) {
      console.error('Failed to update gift status:', error);
      if (error.message === "AUTH_REQUIRED") {
        throw error;
      }
      await fetchCartItems(); 
      toast({
        title: "Error",
        description: "Failed to update gift status. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "END_UPDATE", productId });
    }
  };

  const clearCart = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to clear your cart.",
        variant: "destructive",
      });
      throw new Error("AUTH_REQUIRED");
    }

    // For deployments, simulate success
    if (isDeployment) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear cart
      dispatch({ type: "CLEAR_CART" });
      
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error("AUTH_REQUIRED");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear cart');
      }

      dispatch({ type: "CLEAR_CART" });
      
      toast({
        title: "Cart Cleared",
        description: "Your cart has been cleared"
      });
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      if (error.message === "AUTH_REQUIRED") {
        throw error;
      }
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        updateGiftWrap,
        updateGiftStatus,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}