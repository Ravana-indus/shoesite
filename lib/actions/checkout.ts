'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { ShippingData } from '@/components/checkout/ShippingForm';
import { cookies } from 'next/headers';

export async function getShippingMethods() {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching shipping methods:', error);
    return [];
  }
  return data || [];
}

export async function getActiveCart(sessionId: string) {
  const supabase = createServerClient();
  
  const { data: cart, error } = await supabase
    .from('carts')
    .select(`
      *,
      cart_items(*, product:products(*))
    `)
    .eq('session_id', sessionId)
    .eq('status', 'active')
    .single();
  
  if (error || !cart) {
    return null;
  }
  return cart;
}

export async function calculateOrderTotals(
  cart: any,
  shippingMethodId: string,
  promoDiscount: number = 0
) {
  const supabase = createServerClient();
  
  const { data: shippingMethod } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('id', shippingMethodId)
    .single();
  
  if (!shippingMethod) {
    return null;
  }
  
  const subtotal = cart.cart_items.reduce(
    (sum: number, item: any) => sum + (item.price_cents || 0) * (item.quantity || 0),
    0
  );
  
  let shipping = shippingMethod.price_cents;
  // Free shipping over 10000
  if (subtotal >= 10000) {
    shipping = 0;
  }
  
  const discount = promoDiscount;
  const total = subtotal + shipping - discount;
  
  return {
    subtotal,
    shipping,
    discount,
    total,
    shippingMethod: shippingMethod.name,
  };
}

export async function createOrder(
  cartId: string,
  shippingData: ShippingData,
  shippingMethodId: string,
  promoDiscount: number = 0
): Promise<{ orderId?: string; orderNumber?: string; error?: string }> {
  const supabase = createServerClient();
  
  // Get cart items
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select(`
      *,
      cart_items(*, product:products(*))
    `)
    .eq('id', cartId)
    .single();
  
  if (cartError || !cart || !cart.cart_items?.length) {
    return { error: 'Cart not found or empty' };
  }
  
  const totals = await calculateOrderTotals(cart, shippingMethodId, promoDiscount);
  if (!totals) {
    return { error: 'Invalid shipping method' };
  }
  
  // Generate order number
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `ADL-${year}-${randomPart}`;
  
  // Get user if authenticated
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_id')?.value;
  let userId = null;
  
  if (sessionToken) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  }
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId,
      email: shippingData.email,
      subtotal_cents: totals.subtotal,
      shipping_cents: totals.shipping,
      discount_cents: totals.discount,
      total_cents: totals.total,
      status: 'pending',
      payment_status: 'pending',
      fulfillment_status: 'unfulfilled',
    })
    .select()
    .single();
  
  if (orderError) {
    console.error('Order creation error:', orderError);
    return { error: orderError.message };
  }
  
  // Create order items
  const orderItems = cart.cart_items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id || null,
    quantity: item.quantity,
    unit_price_cents: item.price_cents,
    total_cents: item.price_cents * item.quantity,
    product_name: item.product?.name || 'Unknown Product',
    variant_name: item.variant?.name || null,
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) {
    console.error('Order items error:', itemsError);
  }
  
  // Create shipping address only if user is authenticated
  if (userId && shippingData.fullName) {
    await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        recipient_name: shippingData.fullName,
        phone: shippingData.phone,
        address_line_1: shippingData.addressLine1,
        address_line_2: shippingData.addressLine2 || null,
        city: shippingData.city,
        district: shippingData.district,
        postal_code: shippingData.postalCode || null,
        country: 'Sri Lanka',
      });
  }
  
  // Clear cart
  await supabase.from('cart_items').delete().eq('cart_id', cartId);
  await supabase.from('carts').delete().eq('id', cartId);
  
  return { orderId: order.id, orderNumber: order.order_number };
}

export async function getPayHereCheckoutUrl(
  orderId: string,
  amount: number,
  customerEmail: string,
  orderNumber: string
): Promise<{ url?: string; error?: string }> {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  
  if (!merchantId || !merchantSecret) {
    console.warn('PayHere credentials not configured');
    // Return mock success for demo
    return { url: `/checkout/success?order_id=${orderId}` };
  }
  
  const isSandbox = process.env.PAYHERE_SANDBOX === 'true';
  const baseUrl = isSandbox 
    ? 'https://sandbox.payhere.lk/pay/checkout' 
    : 'https://www.payhere.lk/pay/checkout';
  
  // Generate hash
  const hash = await generatePayHereHash(orderNumber, amount, merchantSecret);
  
  const params = new URLSearchParams({
    merchant_id: merchantId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/cancel`,
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/payhere`,
    order_id: orderNumber,
    items: `Order ${orderNumber}`,
    amount: amount.toString(),
    currency: 'LKR',
    hash: hash,
    first_name: '',
    last_name: '',
    email: customerEmail,
    phone: '',
    address: '',
    city: '',
    country: 'Sri Lanka',
  });
  
  return { url: `${baseUrl}?${params.toString()}` };
}

async function generatePayHereHash(orderId: string, amount: number, secret: string): Promise<string> {
  const crypto = await import('crypto');
  const hash = crypto.createHash('md5');
  hash.update(orderId + amount + secret);
  return hash.digest('hex').toUpperCase();
}