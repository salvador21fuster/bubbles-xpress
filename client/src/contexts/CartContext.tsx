import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface CartContextType {
  cart: Record<string, CartItem>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productCode: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  getCartItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, CartItem>>(() => {
    // Load cart from localStorage on mount
    const saved = localStorage.getItem('mrBubblesCart');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mrBubblesCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev[item.productCode];
      if (existing) {
        return {
          ...prev,
          [item.productCode]: {
            ...existing,
            quantity: existing.quantity + 1,
          },
        };
      }
      return {
        ...prev,
        [item.productCode]: { ...item, quantity: 1 },
      };
    });
  };

  const removeFromCart = (productCode: string) => {
    setCart(prev => {
      const existing = prev[productCode];
      if (!existing) return prev;

      if (existing.quantity > 1) {
        return {
          ...prev,
          [productCode]: {
            ...existing,
            quantity: existing.quantity - 1,
          },
        };
      }

      const newCart = { ...prev };
      delete newCart[productCode];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('mrBubblesCart');
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const getCartItems = () => {
    return Object.values(cart);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
        getCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
