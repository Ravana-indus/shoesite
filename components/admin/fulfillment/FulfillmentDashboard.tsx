'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatPriceCents } from '@/lib/types/database';
import { Icon } from '@/components/admin/ui/Icon';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  fulfilled_quantity: number;
  refunded_quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  email: string;
  created_at: string;
  status: string;
  fulfillment_status: string;
  total_cents: number;
  items: OrderItem[];
}

type FulfillmentStatusFilter = 'unfulfilled' | 'partial' | 'fulfilled' | 'all';

export function FulfillmentDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatusFilter>('unfulfilled');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkCarrier, setBulkCarrier] = useState('');
  const [performingBulk, setPerformingBulk] = useState(false);
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
        .limit(500);

      const toFulfill = (data || []).filter(o =>
        o.status !== 'cancelled' && o.status !== 'refunded'
      );

      const detailedOrders = await Promise.all(
        toFulfill.map(async o => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', o.id);
          return { ...o, items: items || [] };
        })
      );

      setOrders(detailedOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.fulfillment_status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return o.order_number?.toLowerCase().includes(query) ||
               o.email?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  function handleSelectAll() {
    if (selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  }

  function handleSelectOne(id: string) {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrderIds(next);
  }

  async function handleBulkAction() {
    if (selectedOrderIds.size === 0 || !bulkAction) return;
    setPerformingBulk(true);

    try {
      if (bulkAction === 'mark_shipped') {
        for (const id of selectedOrderIds) {
          await supabase.from('orders').update({ status: 'shipped' }).eq('id', id);
        }
      } else if (bulkAction === 'mark_delivered') {
        for (const id of selectedOrderIds) {
          await supabase.from('orders').update({ status: 'delivered' }).eq('id', id);
        }
      } else if (bulkAction === 'fulfill') {
        for (const id of selectedOrderIds) {
          const order = orders.find(o => o.id === id);
          if (!order) continue;
          
          const itemsToFulfill = order.items.filter(i => (i.fulfilled_quantity ?? 0) < i.quantity);
          if (itemsToFulfill.length > 0) {
            const { data: fulfillment } = await supabase
              .from('order_fulfillments')
              .insert({
                order_id: id,
                carrier: bulkCarrier || null,
                status: 'pending',
              })
              .select()
              .single();

            if (fulfillment) {
              for (const item of itemsToFulfill) {
                await supabase.from('order_fulfillment_items').insert({
                  fulfillment_id: fulfillment.id,
                  order_item_id: item.id,
                  quantity: item.quantity - (item.fulfilled_quantity ?? 0),
                });
              }
            }
          }
        }
      }
      await loadOrders();
      setSelectedOrderIds(new Set());
      setBulkAction('');
      setBulkCarrier('');
    } catch (e) {
      console.error(e);
      alert('Error performing bulk action');
    } finally {
      setPerformingBulk(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-outline-variant/10">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm flex-1">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg border border-outline-variant/10 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as FulfillmentStatusFilter)}
            className="px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/10 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Fulfillments</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="partial">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      {selectedOrderIds.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-primary">{selectedOrderIds.size} orders selected</span>
          <select
            value={bulkAction}
            onChange={e => setBulkAction(e.target.value)}
            className="px-3 py-2 bg-surface rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Select bulk action...</option>
            <option value="fulfill">Fulfill Orders</option>
            <option value="mark_shipped">Mark Status as Shipped</option>
            <option value="mark_delivered">Mark Status as Delivered</option>
          </select>

          {bulkAction === 'fulfill' && (
            <select
              value={bulkCarrier}
              onChange={e => setBulkCarrier(e.target.value)}
              className="px-3 py-2 bg-surface rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Select Carrier (Optional)</option>
              <option value="SL Post">SL Post</option>
              <option value="DHL">DHL</option>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
            </select>
          )}

          <button
            onClick={handleBulkAction}
            disabled={performingBulk || !bulkAction}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {performingBulk ? 'Processing...' : 'Apply Action'}
          </button>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant/10">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-outline-variant/50 accent-primary"
                  />
                </th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Order</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Date</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Customer</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Fulfillment</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">No orders match the filters.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.has(order.id)}
                        onChange={() => handleSelectOne(order.id)}
                        className="rounded border-outline-variant/50 accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-sm text-primary">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                        order.fulfillment_status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                        order.fulfillment_status === 'partial' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.fulfillment_status || 'unfulfilled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                        ['shipped', 'delivered'].includes(order.status) ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right">
                      {formatPriceCents(order.total_cents)}
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
