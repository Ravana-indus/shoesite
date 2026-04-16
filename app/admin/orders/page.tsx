import { createClient } from '@/utils/supabase/server';
import { formatPriceCents } from '@/lib/types/database';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const ordersList = orders || [];

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Orders</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {ordersList.length} orders total
          </p>
        </div>
        <Link href="/admin" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
          <Icon name="arrow_back" className="text-sm" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Order</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Customer</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Status</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Payment</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Fulfillment</th>
                <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Total</th>
                <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {ordersList.map(order => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-sm font-bold text-primary">{order.order_number}</span>
                  </td>
                  <td className="p-4 text-sm">{order.email}</td>
                  <td className="p-4">
                    <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>
                      {order.payment_status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      order.fulfillment_status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                      order.fulfillment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-surface-container text-on-surface-variant'
                    }`}>
                      {order.fulfillment_status || 'unfulfilled'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {formatPriceCents(order.total_cents)}
                  </td>
                  <td className="p-4 text-right text-sm text-on-surface-variant">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {ordersList.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}