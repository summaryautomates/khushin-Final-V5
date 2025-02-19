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
}

type CartAction =
  | { type: "SET_CART_ITEMS"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_GIFT_WRAP"; payload: { type: GiftWrapType; cost: number } }
  | { type: "CLEAR_CART" };

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
      return { ...state, isLoading: action.payload, error: null };

    case "SET_CART_ITEMS":
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
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
        error: null,
      };

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        giftWrap: { type: null, cost: 0 },
        discount: null,
        isLoading: false,
        error: null,
      };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

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
    isLoading: false,
    error: null,
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      dispatch({ type: "SET_CART_ITEMS", payload: [] });
      return;
    }

    const loadCartItems = async () => {
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

    loadCartItems();
  }, [user, toast]);

  const addItem = async (product: Product, quantity = 1) => {
    if (!user) {
      toast({
        variant: "destructive",
        description: "Please log in to add items to cart.",
      });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
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

      const items = await response.json();
      dispatch({ type: "SET_CART_ITEMS", payload: items });
      toast({
        description: `${product.name} added to cart`,
      });
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      dispatch({ type: "SET_CART_ITEMS", payload: state.items });
      toast({
        variant: "destructive",
        description: error.message || "Failed to add item to cart. Please try again.",
      });
    }
  };

  const removeItem = async (productId: number) => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
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

      const items = await response.json();
      dispatch({ type: "SET_CART_ITEMS", payload: items });
    } catch (error: any) {
      console.error('Failed to remove item from cart:', error);
      dispatch({ type: "SET_ERROR", payload: error.message });
      toast({
        variant: "destructive",
        description: "Failed to remove item from cart. Please try again.",
      });
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) return;
    if (quantity < 0 || quantity > 10) {
      toast({
        variant: "destructive",
        description: "Quantity must be between 1 and 10",
      });
      return;
    }

    const previousItems = state.items;

    const updatedItems = state.items.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    dispatch({ type: "SET_CART_ITEMS", payload: updatedItems });

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
        const data = await response.json();
        throw new Error(data.details || 'Failed to update quantity');
      }

      const items = await response.json();
      dispatch({ type: "SET_CART_ITEMS", payload: items });
    } catch (error: any) {
      console.error('Failed to update quantity:', error);

      dispatch({ type: "SET_CART_ITEMS", payload: previousItems });

      toast({
        variant: "destructive",
        description: error.message === "Maximum quantity per item is 10"
          ? "Maximum quantity per item is 10"
          : "Failed to update quantity. Please try again.",
      });
    }
  };

  const updateGiftWrap = async (type: GiftWrapType, cost: number) => {
    dispatch({ type: "UPDATE_GIFT_WRAP", payload: { type, cost } });
  };

  const clearCart = async () => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
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
      dispatch({ type: "SET_ERROR", payload: error.message });
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