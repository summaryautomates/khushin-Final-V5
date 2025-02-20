import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useRef } from "react";

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
  | { type: "END_UPDATE"; productId: number };

interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  updateGiftWrap: (type: GiftWrapType, cost: number) => Promise<void>;
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

    case "UPDATE_GIFT_WRAP":
      return {
        ...state,
        giftWrap: action.giftWrap,
      };

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

    try {
      dispatch({ type: "SET_LOADING", isLoading: true });
      const response = await fetch('/api/cart', {
        headers: {
          'x-user-id': user.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const items = await response.json();
      dispatch({ type: "SET_CART_ITEMS", items });
    } catch (error: any) {
      console.error('Failed to load cart items:', error);
      dispatch({ type: "SET_ERROR", error: "Failed to load cart items" });
      toast({
        variant: "destructive",
        description: "Failed to load cart items. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (!user) {
      dispatch({ type: "CLEAR_CART" });
      return;
    }
    fetchCartItems();
  }, [user]);

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;

    if (state.pendingUpdates.has(productId)) {
      return;
    }

    if (quantity < 0 || quantity > 10) {
      toast({
        variant: "destructive",
        description: "Quantity must be between 1 and 10",
      });
      return;
    }

    if (quantity === 0) {
      await removeItem(productId);
      return;
    }

    dispatch({ type: "START_UPDATE", productId });

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          productId,
          quantity,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      await fetchCartItems();
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      await fetchCartItems();
      toast({
        variant: "destructive",
        description: "Failed to update quantity. Please try again.",
      });
    } finally {
      dispatch({ type: "END_UPDATE", productId });
    }
  };

  const addItem = async (product: Product, quantity = 1) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "Please log in to add items to cart.",
      });
      return;
    }

    if (state.pendingUpdates.has(product.id)) {
      return;
    }

    dispatch({ type: "START_UPDATE", productId: product.id });

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString()
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || 'Failed to add item to cart');
      }

      await fetchCartItems();
      toast({
        description: `${product.name} added to cart`,
      });
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      toast({
        variant: "destructive",
        description: error.message || "Failed to add item to cart. Please try again.",
      });
    } finally {
      dispatch({ type: "END_UPDATE", productId: product.id });
    }
  };

  const removeItem = async (productId: number) => {
    if (!user) return;

    if (state.pendingUpdates.has(productId)) {
      return;
    }

    dispatch({ type: "START_UPDATE", productId });

    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      await fetchCartItems();
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      await fetchCartItems();
      toast({
        variant: "destructive",
        description: "Failed to remove item from cart. Please try again.",
      });
    } finally {
      dispatch({ type: "END_UPDATE", productId });
    }
  };

  const updateGiftWrap = async (type: GiftWrapType, cost: number) => {
    dispatch({ type: "UPDATE_GIFT_WRAP", giftWrap: { type, cost } });
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      dispatch({ type: "CLEAR_CART" });
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      toast({
        variant: "destructive",
        description: "Failed to clear cart. Please try again.",
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