import { createContext, useContext, useReducer, useEffect, ReactNode, useState } from "react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface CartItem {
  product: Product;
  quantity: number;
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
  error: string | null; // Added error state
}

type CartAction =
  | { type: "SET_DISCOUNT"; payload: { code: string; percent: number } }
  | { type: "CLEAR_DISCOUNT" }
  | { type: "ADD_ITEM"; payload: { product: Product; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: number } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; quantity: number } }
  | { type: "UPDATE_GIFT_WRAP"; payload: { type: GiftWrapType; cost: number } }
  | { type: "SET_CART_ITEMS"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_CART" }
  | { type: "SET_ERROR"; payload: string | null }; // Added error action


interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  updateGiftWrap: (type: GiftWrapType, cost: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload, error: null }; // Clear error on loading

    case "SET_CART_ITEMS":
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
        isLoading: false,
        error: null, // Clear error on success
      };

    case "ADD_ITEM": {
      const existingItem = state.items.find(
        item => item.product.id === action.payload.product.id
      );

      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === action.payload.product.id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          { product: action.payload.product, quantity: action.payload.quantity || 1 }
        ];
      }

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        error: null, // Clear error on success
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        item => item.product.id !== action.payload.productId
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        error: null, // Clear error on success
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity < 1) {
        return state;
      }
      const newItems = state.items.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        error: null, // Clear error on success
      };
    }

    case "UPDATE_GIFT_WRAP":
      return {
        ...state,
        giftWrap: {
          type: action.payload.type,
          cost: action.payload.cost
        },
        error: null, // Clear error on success
      };

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        giftWrap: { type: null, cost: 0 },
        discount: null,
        isLoading: false,
        error: null, // Clear error on success
      };
    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

type GiftWrapType = 'standard' | 'premium' | 'luxury' | null;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    giftWrap: { type: null, cost: 0 },
    discount: null,
    isLoading: true,
    error: null, // Initialize error state
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const [isClearing, setIsClearing] = useState(false);

  // Load cart items whenever the user changes (login/logout)
  useEffect(() => {
    let isMounted = true;

    const loadCartItems = async () => {
      if (!user) {
        dispatch({ type: "SET_CART_ITEMS", payload: [] });
        return;
      }

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await apiRequest('GET', '/api/cart');
        const items = await response.json();

        if (isMounted) {
          dispatch({ type: "SET_CART_ITEMS", payload: items });
        }
      } catch (error: any) {
        console.error('Failed to load cart items:', error);
        if (isMounted) {
          dispatch({ type: "SET_CART_ITEMS", payload: [] });
          dispatch({ type: "SET_ERROR", payload: error.message }); // Set error message
          toast({
            variant: "destructive",
            description: "Failed to load cart items. Please try again.",
          });
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadCartItems();

    return () => {
      isMounted = false;
    };
  }, [user, toast]);

  const addItem = async (product: Product, quantity = 1) => {
    if (!user) {
      return Promise.reject(new Error("AUTH_REQUIRED"));
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity,
      });
      dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
      toast({
        description: `${product.name} added to cart`,
      });
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      dispatch({ type: "SET_ERROR", payload: error.message }); // Set error message
      toast({
        variant: "destructive",
        description: "Failed to add item to cart. Please try again.",
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const removeItem = async (productId: number) => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await apiRequest('DELETE', `/api/cart/${productId}`);
      dispatch({ type: "REMOVE_ITEM", payload: { productId } });
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      dispatch({ type: "SET_ERROR", payload: error.message }); // Set error message
      toast({
        variant: "destructive",
        description: "Failed to remove item from cart. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await apiRequest('PATCH', `/api/cart/${productId}`, { quantity });
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      dispatch({ type: "SET_ERROR", payload: error.message }); // Set error message
      toast({
        variant: "destructive",
        description: "Failed to update quantity. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearCart = async () => {
    if (!user || isClearing) return;

    setIsClearing(true);
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await apiRequest('DELETE', '/api/cart');
      dispatch({ type: "CLEAR_CART" });
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: "SET_ERROR", payload: error.message }); // Set error message
      toast({
        variant: "destructive",
        description: "Failed to clear cart. Please try again.",
      });
    } finally {
      setIsClearing(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateGiftWrap = async (type: GiftWrapType, cost: number) => {
    dispatch({ type: "UPDATE_GIFT_WRAP", payload: { type, cost } });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        updateGiftWrap,
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