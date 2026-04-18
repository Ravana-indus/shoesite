import { cookies } from 'next/headers';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { createServerClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

interface SuccessPageProps {
  searchParams: { order_id?: string };
}

async function getOrder(orderId: string) {
  const supabase = createServerClient();
  
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();
  
  return order;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const orderId = searchParams.order_id;
  
  let order = null;
  if (orderId) {
    order = await getOrder(orderId);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="font-display text-3xl font-bold uppercase mb-4">
            Thank You!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your order has been placed successfully.
          </p>
          
          {order && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 text-left">
              <h2 className="font-bold mb-4">Order Details</h2>
              <p className="text-gray-600">
                Order Number: <span className="font-semibold">{order.order_number}</span>
              </p>
              <p className="text-gray-600">
                Total: <span className="font-semibold">Rs. {(order.total_cents / 100).toLocaleString()}</span>
              </p>
              <p className="text-gray-600">
                Items: {order.order_items?.length || 0}
              </p>
            </div>
          )}
          
          <p className="text-gray-500 mb-8">
            A confirmation email will be sent to your email address once the payment is confirmed.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/account/orders">
              <Button>View My Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}