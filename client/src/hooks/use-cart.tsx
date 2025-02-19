import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
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
  error: string | null;
  pendingUpdates: Set<number>;
}

type CartAction =
  | { type: "SET_CART_ITEMS"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_GIFT_WRAP"; payload: { type: GiftWrapType; cost: number } }
  | { type: "CLEAR_CART" }
  | { type: "START_UPDATE"; payload: number }
  | { type: "END_UPDATE"; payload: number };

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
      return { ...state, isLoading: action.payload };

    case "SET_CART_ITEMS":
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((total, item) => total + item.product.price * item.quantity, 0),
        isLoading: false,
        error: null,
      };

    case "UPDATE_GIFT_WRAP":
      return {
        ...state,
        giftWrap: {
          type: action.payload.type,
          cost: action.payload.cost
        },
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

    case "START_UPDATE":
      return {
        ...state,
        pendingUpdates: new Set([...state.pendingUpdates, action.payload]),
      };

    case "END_UPDATE":
      const updates = new Set(state.pendingUpdates);
      updates.delete(action.payload);
      return {
        ...state,
        pendingUpdates: updates,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

type GiftWrapType = 'standard' | 'premium' | 'luxury' | null;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    giftWrap: { type: null, cost: 0 },
    discount: null,
    isLoading: false,
    error: null,
    pendingUpdates: new Set(),
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCartItems = async () => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'x-user-id': user.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const items = await response.json();
      dispatch({ type: "SET_CART_ITEMS", payload: items });
    } catch (error: any) {
      console.error('Failed to load cart items:', error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast({
        variant: "destructive",
        description: "Failed to load cart items. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (!user) {
      dispatch({ type: "SET_CART_ITEMS", payload: [] });
      return;
    }
    fetchCartItems();
  }, [user]);

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;

    // Prevent updates if there's already a pending update for this product
    if (state.pendingUpdates.has(productId)) {
      return;
    }

    // Validate quantity
    if (quantity < 0 || quantity > 10) {
      toast({
        variant: "destructive",
        description: "Quantity must be between 1 and 10",
      });
      return;
    }

    // For quantity 0, remove the item
    if (quantity === 0) {
      await removeItem(productId);
      return;
    }

    dispatch({ type: "START_UPDATE", payload: productId });

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

      const updatedItems = await response.json();
      dispatch({ type: "SET_CART_ITEMS", payload: updatedItems });
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      // Refresh cart items to ensure consistent state
      await fetchCartItems();
      toast({
        variant: "destructive",
        description: "Failed to update quantity. Please try again.",
      });
    } finally {
      dispatch({ type: "END_UPDATE", payload: productId });
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

    dispatch({ type: "START_UPDATE", payload: product.id });

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

      const updatedItems = await response.json();
      dispatch({ type: "SET_CART_ITEMS", payload: updatedItems });
      toast({
        description: `${product.name} added to cart`,
      });
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      await fetchCartItems();
      toast({
        variant: "destructive",
        description: error.message || "Failed to add item to cart. Please try again.",
      });
    } finally {
      dispatch({ type: "END_UPDATE", payload: product.id });
    }
  };

  const removeItem = async (productId: number) => {
    if (!user) return;

    if (state.pendingUpdates.has(productId)) {
      return;
    }

    dispatch({ type: "START_UPDATE", payload: productId });

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

      const updatedItems = await response.json();
      dispatch({ type: "SET_CART_ITEMS", payload: updatedItems });
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      await fetchCartItems();
      toast({
        variant: "destructive",
        description: "Failed to remove item from cart. Please try again.",
      });
    } finally {
      dispatch({ type: "END_UPDATE", payload: productId });
    }
  };

  const updateGiftWrap = async (type: GiftWrapType, cost: number) => {
    dispatch({ type: "UPDATE_GIFT_WRAP", payload: { type, cost } });
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