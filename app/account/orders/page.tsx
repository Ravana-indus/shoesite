'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { formatPriceCents } from '@/lib/types/database';
import Link from 'next/link';

async function getOrders() {
  const supabase = createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return orders?.map((order) => ({
    ...order,
    item_count: order.order_items?.[0]?.count || 0,
  })) || [];
}

export default async function OrdersPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/account/orders');
  }

  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold uppercase">My Orders</h1>
        
        <select className="border border-gray-300 rounded px-3 py-2 text-sm">
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="text-black underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order {order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-LK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status?.charAt(0).toUpperCase()}{(order.status || 'pending').slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{formatPriceCents(order.total_cents)}</p>
                  <p className="text-sm text-gray-600">{order.item_count} items</p>
                </div>
                
                <div className="flex gap-4">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}