import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Cart, CartItem, Product, ProductImage } from '../types/database';
import { formatPriceCents } from '../types/database';
import AddToCartToast from '../components/AddToCartToast';

interface ToastItem {
  title: string;
  imgSrc: string;
  price: string;
}

interface CartItemUI {
  id: string;
  productId: string;
  variantId?: string;
  brand: string;
  title: string;
  priceValue: number;
  price: string;
  originalPrice: string;
  originalPriceValue: number;
  imgSrc: string;
  size: string;
  quantity: number;
  badge?: { label: string; type: 'clearance' | 'bargain' };
}

interface CartContextType {
  items: CartItemUI[];
  addItem: (item: Omit<CartItemUI, 'price' | 'id' | 'originalPriceValue'> & { id?: string; price?: string; originalPriceValue?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  totalSavings: number;
  syncing: boolean;
}

const CART_STORAGE_KEY = 'heritage_cart_items';
const CART_VERSION_KEY = 'heritage_cart_version';
const CURRENT_VERSION = '2';

const CartContext = createContext<CartContextType | null>(null);

// Helper to create unique key for item
function getItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

// Helper to merge items by productId (sum quantities)
function mergeItemsByProductId(items: CartItemUI[]): CartItemUI[] {
  const merged = new Map<string, CartItemUI>();
  
  for (const item of items) {
    const key = getItemKey(item.productId, item.variantId);
    const existing = merged.get(key);
    
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.set(key, { ...item });
    }
  }
  
  return Array.from(merged.values());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItemUI[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [toastItem, setToastItem] = useState<ToastItem | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const isLoadedRef = useRef(false);
  const isSavingRef = useRef(false);

  // Load cart on mount - only runs once
  useEffect(() => {
    if (isLoadedRef.current) return;
    isLoadedRef.current = true;
    
    // Check if we need to reset (version mismatch = schema change)
    const storedVersion = localStorage.getItem(CART_VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      console.log('Cart version mismatch, clearing localStorage');
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.setItem(CART_VERSION_KEY, CURRENT_VERSION);
      setItems([]);
      return;
    }
    
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Always merge to be safe
          const merged = mergeItemsByProductId(parsed);
          setItems(merged);
          console.log('Cart loaded:', merged.length, 'items, total qty:', merged.reduce((s, i) => s + i.quantity, 0));
        }
      } catch (e) {
        console.error('Failed to parse cart:', e);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoadedRef.current || isSavingRef.current) return;
    
    // Always dedupe before saving
    const deduped = mergeItemsByProductId(items);
    
    // Only save if different from current
    const currentStored = localStorage.getItem(CART_STORAGE_KEY);
    const newStored = JSON.stringify(deduped);
    
    if (currentStored !== newStored) {
      isSavingRef.current = true;
      localStorage.setItem(CART_STORAGE_KEY, newStored);
      localStorage.setItem(CART_VERSION_KEY, CURRENT_VERSION);
      
      // If we deduped, update state too
      if (deduped.length !== items.length) {
        console.log('Deduped items before save:', items.length, '->', deduped.length);
        setItems(deduped);
      }
      
      setTimeout(() => { isSavingRef.current = false; }, 0);
    }
  }, [items]);

  // Sync with database when user logs in
  useEffect(() => {
    if (isLoadedRef.current && !authLoading && user) {
      syncCartWithDatabase();
    }
  }, [user, authLoading]);

  async function syncCartWithDatabase() {
    if (!user) return;
    setSyncing(true);
    
    try {
      // Get or create user's cart
      const { data: existing } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      let userCart = existing;
      if (!userCart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert({ user_id: user.id, status: 'active' })
          .select()
          .single();
        userCart = newCart;
      }
      
      if (!userCart) {
        setSyncing(false);
        return;
      }
      
      setCart(userCart);
      
      // Get local items
      const localItems = items;
      
      // Load items from database
      const { data: dbCartItems } = await supabase
        .from('cart_items')
        .select('*, product:products(*, images:product_images(*))')
        .eq('cart_id', userCart.id);

      // Convert DB items to UI format
      let dbItems: CartItemUI[] = (dbCartItems || []).map(ci => {
        const product = (ci.product as Product);
        const images = ((ci.product as any)?.images as ProductImage[]) ?? [];
        return {
          id: ci.id,
          productId: ci.product_id,
          variantId: ci.variant_id || undefined,
          brand: (ci.product as any)?.brand?.name ?? '',
          title: product?.name ?? '',
          priceValue: ci.price_cents,
          price: formatPriceCents(ci.price_cents),
          originalPrice: product?.compare_at_price_cents ? formatPriceCents(product.compare_at_price_cents) : '',
          originalPriceValue: product?.compare_at_price_cents ?? 0,
          imgSrc: images[0]?.url ?? '',
          size: product?.tagline ?? '',
          quantity: ci.quantity,
        };
      });

      // Merge local items into database
      if (localItems.length > 0) {
        console.log('Syncing', localItems.length, 'local items with', dbItems.length, 'DB items');
        
        for (const localItem of localItems) {
          const existingDbItem = dbItems.find(dbItem => 
            dbItem.productId === localItem.productId && 
            dbItem.variantId === localItem.variantId
          );
          
          if (existingDbItem) {
            // Update quantity in database (add local quantity to existing)
            const newQuantity = existingDbItem.quantity + localItem.quantity;
            await supabase
              .from('cart_items')
              .update({ quantity: newQuantity })
              .eq('id', existingDbItem.id);
            existingDbItem.quantity = newQuantity;
          } else {
            // Insert new item to database
            const { data: newItem } = await supabase
              .from('cart_items')
              .insert({
                cart_id: userCart.id,
                product_id: localItem.productId,
                variant_id: localItem.variantId || null,
                quantity: localItem.quantity,
                price_cents: localItem.priceValue,
              })
              .select('*, product:products(*, images:product_images(*))')
              .single();
            
            if (newItem) {
              const product = (newItem.product as Product);
              const images = ((newItem.product as any)?.images as ProductImage[]) ?? [];
              dbItems.push({
                id: newItem.id,
                productId: newItem.product_id,
                variantId: newItem.variant_id || undefined,
                brand: (newItem.product as any)?.brand?.name ?? '',
                title: product?.name ?? '',
                priceValue: newItem.price_cents,
                price: formatPriceCents(newItem.price_cents),
                originalPrice: product?.compare_at_price_cents ? formatPriceCents(product.compare_at_price_cents) : '',
                originalPriceValue: product?.compare_at_price_cents ?? 0,
                imgSrc: images[0]?.url ?? '',
                size: product?.tagline ?? '',
                quantity: newItem.quantity,
              });
            }
          }
        }
      }

      // Final dedupe and set
      const mergedItems = mergeItemsByProductId(dbItems);
      setItems(mergedItems);
      
      // Clear localStorage after successful sync
      localStorage.removeItem(CART_STORAGE_KEY);
      console.log('Cart synced. Final items:', mergedItems.length, 'total qty:', mergedItems.reduce((s, i) => s + i.quantity, 0));
      
    } catch (e) { 
      console.error('Cart sync error:', e); 
    } finally { 
      setSyncing(false); 
    }
  }

  const addItem = useCallback(async (item: Omit<CartItemUI, 'price' | 'id'> & { id?: string; price?: string }) => {
    const priceValue = item.priceValue;
    const price = formatPriceCents(priceValue);
    const productId = item.productId || item.id!;

    setItems(prev => {
      const key = getItemKey(productId, item.variantId);
      const existingIndex = prev.findIndex(i => getItemKey(i.productId, i.variantId) === key);
      
      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + item.quantity
        };
        return newItems;
      } else {
        // Add new item
        return [...prev, {
          id: crypto.randomUUID(),
          productId,
          variantId: item.variantId,
          brand: item.brand,
          title: item.title,
          priceValue,
          price,
          originalPrice: item.originalPrice ?? '',
          imgSrc: item.imgSrc ?? '',
          size: item.size ?? '',
          quantity: item.quantity,
          badge: item.badge,
        }];
      }
    });

    // Show confirmation toast
    setToastItem({ title: item.title, imgSrc: item.imgSrc ?? '', price: formatPriceCents(priceValue) });
    setToastVisible(true);

    // Sync to database if logged in
    if (user && cart) {
      try {
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cart.id)
          .eq('product_id', productId)
          .eq('variant_id', item.variantId || null)
          .single();

        if (existingItem) {
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('id', existingItem.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({
              cart_id: cart.id,
              product_id: productId,
              variant_id: item.variantId || null,
              quantity: item.quantity,
              price_cents: priceValue,
            });
        }
      } catch (e) { 
        console.error('Add to cart DB error:', e); 
      }
    }
  }, [user, cart]);

  const removeItem = useCallback(async (productId: string, variantId?: string) => {
    setItems(prev => prev.filter(i => 
      !(i.productId === productId && i.variantId === variantId)
    ));

    if (user && cart) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id)
          .eq('product_id', productId)
          .eq('variant_id', variantId || null);
      } catch (e) {
        console.error('Remove from cart DB error:', e);
      }
    }
  }, [user, cart]);

  const updateQuantity = useCallback(async (productId: string, qty: number, variantId?: string) => {
    setItems(prev => {
      if (qty <= 0) {
        return prev.filter(i => !(i.productId === productId && i.variantId === variantId));
      }
      return prev.map(i => 
        (i.productId === productId && i.variantId === variantId) 
          ? { ...i, quantity: qty } 
          : i
      );
    });

    if (user && cart) {
      try {
        if (qty <= 0) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .eq('variant_id', variantId || null);
        } else {
          // Find the item first to get its ID
          const { data: item } = await supabase
            .from('cart_items')
            .select('id')
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .eq('variant_id', variantId || null)
            .single();
            
          if (item) {
            await supabase
              .from('cart_items')
              .update({ quantity: qty })
              .eq('id', item.id);
          }
        }
      } catch (e) {
        console.error('Update quantity DB error:', e);
      }
    }
  }, [user, cart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    
    if (user && cart) {
      try {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      } catch (e) {
        console.error('Clear cart DB error:', e);
      }
    }
  }, [user, cart]);

  // Recalculate totals from deduped items
  const dedupedItems = mergeItemsByProductId(items);
  const itemCount = dedupedItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = dedupedItems.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);
  const totalSavings = dedupedItems.reduce((sum, i) => {
    const originalTotal = i.originalPriceValue * i.quantity;
    const actualTotal = i.priceValue * i.quantity;
    return sum + (originalTotal - actualTotal);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      items: dedupedItems, // Always return deduped items
      addItem, 
      removeItem: (productId: string) => removeItem(productId, undefined), 
      updateQuantity: (productId: string, qty: number) => updateQuantity(productId, qty, undefined), 
      clearCart, 
      itemCount, 
      subtotal, 
      totalSavings,
      syncing 
    }}>
      {children}
      <AddToCartToast
        item={toastItem}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
