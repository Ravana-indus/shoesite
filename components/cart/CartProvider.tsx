'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price_cents: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price_cents: number;
    product_images?: { url: string; alt_text?: string }[];
    brand?: { name: string };
  };
}

interface Cart {
  id: string;
  session_id: string;
  status: string;
  cart_items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, variantId: string | undefined, quantity: number, priceCents: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  isUpdating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadCart = async () => {
      const savedCartId = localStorage.getItem('cartId');
      if (savedCartId) {
const { data: cartData } = await supabase
          .from('carts')
          .select('*, cart_items(*, products(*, brands(name), product_images(url)))')
          .eq('id', savedCartId)
          .single();
        
        if (cartData) {
          const typedCart = cartData as any;
          const items = typedCart.cart_items?.map((item: any) => ({
            ...item,
            product: item.products,
          })) || [];
          setCart({
            ...typedCart,
            cart_items: items,
            totalQuantity: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
          });
        } else {
          createNewCart();
        }
      } else {
        createNewCart();
      }
    };

    loadCart();
  }, []);

  async function createNewCart() {
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ status: 'active' })
      .select()
      .single();

    if (newCart && !error) {
      localStorage.setItem('cartId', newCart.id);
      setCart({ ...newCart, cart_items: [], totalQuantity: 0 });
    }
  }

  async function refreshCart() {
    if (!cart) return;
    const { data: cartData } = await supabase
      .from('carts')
      .select('*, cart_items(*, products(*, brands(name), product_images(url)))')
      .eq('id', cart.id)
      .single();
    
    if (cartData) {
      const items = ((cartData as any).cart_items || []).map((item: any) => ({
        ...item,
        product: item.products,
      }));
      setCart({
        ...cartData,
        cart_items: items,
        totalQuantity: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
      });
    }
  }

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = async (productId: string, variantId: string | undefined, quantity: number, priceCents: number) => {
    if (!cart) return;
    setIsUpdating(true);

    try {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .eq('variant_id', variantId || null)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId || null,
          quantity,
          price_cents: priceCents,
        });
      }

      await refreshCart();
      openCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(true);
    try {
      await supabase.from('cart_items').delete().eq('id', itemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    setIsUpdating(true);
    try {
      if (quantity <= 0) {
        await supabase.from('cart_items').delete().eq('id', itemId);
      } else {
        await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
      }
      await refreshCart();
    } catch (error) {
      console.error('Error updating cart:', error);
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
        isUpdating,
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