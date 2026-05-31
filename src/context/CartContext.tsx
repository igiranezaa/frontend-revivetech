import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Device, CartItem, ToastState } from './type';
import  { CartContext } from './type';

const CART_STORAGE_KEY = 'jaribu_cart';
const CART_CLEARED_EVENT = 'revivetech:cart-cleared';

export function CartProvider({ children }: { children: ReactNode }) {
  // 📦 Local Storage Hydration on Initial Load
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });

  // 💾 Sync Cart State Changes to LocalStorage Automatically
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const handleCartCleared = () => {
      setCart([]);
      setIsCartOpen(false);
    };
    window.addEventListener(CART_CLEARED_EVENT, handleCartCleared);
    return () => window.removeEventListener(CART_CLEARED_EVENT, handleCartCleared);
  }, []);

  // 🔔 Triggers a 3-second self-dismissing toast animation banner
  const triggerToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.current_price * item.quantity, 0);

  const addToCart = (device: Device) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === device.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === device.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...device, quantity: 1 }];
    });
    triggerToast(`"${device.title}" added to cart!`);
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  // ➕/➖ Adjust quantities with a safety limit stopping subtraction below 1 item
  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + delta;
          return nextQty >= 1 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      })
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        toast,
        triggerToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
