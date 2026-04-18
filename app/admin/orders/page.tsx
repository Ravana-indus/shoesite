'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatPriceCents } from '@/lib/types/database';
import type { Order } from '@/lib/types/database';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return o.order_number?.toLowerCase().includes(query) || o.email?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Orders</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {orders.length} orders total
          </p>
        </div>
        <Link href="/admin" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
          <Icon name="arrow_back" className="text-sm" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-xs">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface rounded-lg border border-outline-variant/10 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-surface rounded-lg border border-outline-variant/10 text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
                <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/invoice/${order.id}`}
                          className="p-1 text-on-surface-variant hover:text-primary"
                          title="Print Invoice"
                          target="_blank"
                        >
                          <Icon name="receipt" className="text-sm" />
                        </Link>
                        <Link
                          href={`/admin/sticker/${order.id}`}
                          className="p-1 text-on-surface-variant hover:text-primary"
                          title="Print Sticker"
                          target="_blank"
                        >
                          <Icon name="local_shipping" className="text-sm" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}