import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { getCart, updateCartItemQuantity, removeCartItem } from '@/lib/actions/cart';

export default async function CartPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  if (!sessionId) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <EmptyCart />
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  const cart = await getCart(sessionId);
  
  if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <EmptyCart />
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  const subtotal = cart.cart_items.reduce(
    (sum, item: any) => sum + (item.price_cents || 0) * (item.quantity || 0),
    0
  );
  
  const itemCount = cart.cart_items.reduce(
    (sum, item: any) => sum + (item.quantity || 0),
    0
  );
  
  async function handleUpdateQuantity(itemId: string, quantity: number) {
    'use server';
    await updateCartItemQuantity(itemId, quantity);
  }
  
  async function handleRemove(itemId: string) {
    'use server';
    await removeCartItem(itemId);
  }
  
  async function handleCheckout() {
    'use server';
    redirect('/checkout');
  }
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-display text-3xl font-bold uppercase mb-8">
            Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cart.cart_items.map((item: any) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={subtotal}
                itemCount={itemCount}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}