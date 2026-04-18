'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';

export async function getCart(sessionId: string) {
  const supabase = createServerClient();
  
  const { data: cart, error } = await supabase
    .from('carts')
    .select(`
      *,
      cart_items(
        *,
        product:products(*, product_images(url), categories(name)),
        variant:product_variants(name)
      )
    `)
    .eq('session_id', sessionId)
    .eq('status', 'active')
    .single();
  
  if (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
  return cart;
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = createServerClient();
  
  if (quantity < 1) {
    return { error: 'Quantity must be at least 1' };
  }
  
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);
  
  if (error) {
    console.error('Error updating quantity:', error);
    return { error: error.message };
  }
  
  revalidatePath('/cart');
  return { success: true };
}

export async function removeCartItem(itemId: string) {
  const supabase = createServerClient();
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);
  
  if (error) {
    console.error('Error removing item:', error);
    return { error: error.message };
  }
  
  revalidatePath('/cart');
  return { success: true };
}