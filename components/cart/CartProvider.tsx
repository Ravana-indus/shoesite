'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Cart } from '@/lib/shopify/types';
import { getCart, createCart, addToCart, removeFromCart, updateCart } from '@/lib/shopify';

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItemQuantity: (lineId: string, variantId: string, quantity: number) => Promise<void>;
  isUpdating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Attempt to load cart from localStorage
    const savedCartId = localStorage.getItem('cartId');
    if (savedCartId) {
      getCart(savedCartId).then((fetchedCart) => {
        if (fetchedCart) {
          setCart(fetchedCart);
        } else {
          localStorage.removeItem('cartId');
        }
      });
    }
  }, []);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const getOrCreateCart = async () => {
    if (cart?.id) return cart.id;
    const newCart = await createCart();
    setCart(newCart);
    localStorage.setItem('cartId', newCart.id);
    return newCart.id;
  };

  const addItem = async (variantId: string, quantity: number) => {
    setIsUpdating(true);
    try {
      const cartId = await getOrCreateCart();
      const updatedCart = await addToCart(cartId, [{ merchandiseId: variantId, quantity }]);
      setCart(updatedCart);
      openCart();
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (lineId: string) => {
    if (!cart?.id) return;
    setIsUpdating(true);
    try {
      const updatedCart = await removeFromCart(cart.id, [lineId]);
      setCart(updatedCart);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateItemQuantity = async (lineId: string, variantId: string, quantity: number) => {
    if (!cart?.id) return;
    setIsUpdating(true);
    if (quantity === 0) {
      await removeItem(lineId);
      return;
    }
    try {
      const updatedCart = await updateCart(cart.id, [{ id: lineId, merchandiseId: variantId, quantity }]);
      setCart(updatedCart);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateItemQuantity,
        isUpdating
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
