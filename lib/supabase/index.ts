import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createServerClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
};

export const createBrowserClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
};

export type Product = Database['public']['Tables']['products']['Row'] & {
  brand?: Database['public']['Tables']['brands']['Row'];
  categories?: Database['public']['Tables']['categories']['Row'];
  product_images?: Database['public']['Tables']['product_images']['Row'][];
  product_variants?: Database['public']['Tables']['product_variants']['Row'][];
};

export async function getProducts(options?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}): Promise<Product[]> {
  const client = createServerClient();
  
  let query = client
    .from('products')
    .select(`
      *,
      brands!inner(name),
      categories!inner(name),
      product_images(url, alt_text, display_order),
      product_variants(id, name, sku, price_cents, compare_at_price_cents, stock_qty, is_active)
    `)
    .order('created_at', { ascending: false });

  if (options?.isActive !== false) {
    query = query.eq('is_active', true);
  }
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.brandId) {
    query = query.eq('brand_id', options.brandId);
  }
  if (options?.limit) {
    query = query.range(0, options.limit - 1);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(p => ({
    ...p,
    brand: (p as any).brands,
    categories: (p as any).categories,
    product_images: (p as any).product_images || [],
    product_variants: (p as any).product_variants || [],
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = createServerClient();
  
  const { data, error } = await client
    .from('products')
    .select(`
      *,
      brands!inner(name),
      categories!inner(name),
      product_images(url, alt_text, display_order),
      product_variants(id, name, sku, price_cents, compare_at_price_cents, stock_qty, is_active, option_values)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return {
    ...data,
    brand: (data as any).brands,
    categories: (data as any).categories,
    product_images: (data as any).product_images || [],
    product_variants: (data as any).product_variants || [],
  } as Product;
}

export async function getFeaturedProducts(limit = 10): Promise<Product[]> {
  const client = createServerClient();
  
  const { data, error } = await client
    .from('products')
    .select(`
      *,
      brands!inner(name),
      product_images(url, alt_text, display_order)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return (data || []).map(p => ({
    ...p,
    brand: (p as any).brands,
    product_images: (p as any).product_images || [],
  }));
}

export async function getNewArrivals(limit = 10): Promise<Product[]> {
  return getProducts({ limit, isActive: true });
}

export type Category = Database['public']['Tables']['categories']['Row'];

export async function getCategories(): Promise<Category[]> {
  const client = createServerClient();
  
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const client = createServerClient();
  
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

export type Brand = Database['public']['Tables']['brands']['Row'];

export async function getBrands(): Promise<Brand[]> {
  const client = createServerClient();
  
  const { data, error } = await client
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return data || [];
}

export type Cart = Database['public']['Tables']['carts']['Row'] & {
  cart_items: (Database['public']['Tables']['cart_items']['Row'] & {
    product: Product;
  })[];
  totalQuantity: number;
};

export async function getOrCreateCart(sessionId?: string): Promise<Cart | null> {
  const client = createServerClient();

  // Try to find existing cart
  if (sessionId) {
    const { data: existing } = await client
      .from('carts')
      .select('*, cart_items(*, products(*, brands!inner(name), product_images(url)))')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .single();

    if (existing) return existing as any;
  }

  // Create new cart
  const { data, error } = await client
    .from('carts')
    .insert({
      session_id: sessionId || crypto.randomUUID(),
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cart:', error);
    return null;
  }

  return data as Cart;
}

export async function addToCart(
  cartId: string,
  productId: string,
  quantity: number,
  priceCents: number,
  variantId?: string
): Promise<boolean> {
  const client = createServerClient();

  // Check existing item
  const { data: existing } = await client
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    // Update quantity
    const { error } = await client
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);

    return !error;
  }

  // Insert new item
  const { error } = await client
    .from('cart_items')
    .insert({
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      price_cents: priceCents,
    });

  return !error;
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const client = createServerClient();
  
  const { error } = await client
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  return !error;
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<boolean> {
  const client = createServerClient();
  
  const { error } = await client
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  return !error;
}