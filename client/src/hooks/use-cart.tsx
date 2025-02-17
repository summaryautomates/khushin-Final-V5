import { createContext, useContext, useReducer, ReactNode } from "react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

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
}

type CartAction =
  | { type: "SET_DISCOUNT"; payload: { code: string; percent: number } }
  | { type: "CLEAR_DISCOUNT" }
  | { type: "ADD_ITEM"; payload: { product: Product; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: number } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: number; quantity: number } }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        item => item.product.id === action.payload.product.id
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
          total: calculateTotal([
            ...state.items.map(item =>
              item.product.id === action.payload.product.id
                ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
                : item
            ),
          ]),
        };
      }

      return {
        ...state,
        items: [...state.items, { product: action.payload.product, quantity: action.payload.quantity || 1 }],
        total: calculateTotal([
          ...state.items,
          { product: action.payload.product, quantity: action.payload.quantity || 1 },
        ]),
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
      };
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        discount: null,
      };

    default:
      return state;
  }
}

function calculateTotal(items: CartItem[], giftWrapCost: number = 0): number {
  const itemsTotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  return itemsTotal + giftWrapCost;
}

type GiftWrapType = 'standard' | 'premium' | 'luxury' | null;

const updateGiftWrap = (type: GiftWrapType, cost: number) => {
  dispatch({ type: "UPDATE_GIFT_WRAP", payload: { type, cost } });
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const { toast } = useToast();

  const addItem = (product: Product, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
    toast({
      description: `${product.name} added to cart`,
    });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
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
