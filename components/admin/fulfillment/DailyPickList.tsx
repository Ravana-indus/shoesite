'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Icon } from '../ui/Icon';
import type { Order, OrderItem, Product } from '@/lib/types/database';

interface ShippingAddress {
  first_name: string;
  last_name: string;
  [key: string]: string;
}

interface OrderWithItems extends Order {
  items: (OrderItem & { product_name: string })[];
  shipping_address: ShippingAddress | null;
}

export function DailyPickList() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadOrders();
  }, [date]);

  async function loadOrders() {
    setLoading(true);
    try {
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'processing', 'confirmed'])
        .order('created_at', { ascending: false });

      if (!allOrders) {
        setOrders([]);
        return;
      }

      const filtered = allOrders.filter(o => {
        if (!o.created_at) return false;
        const orderDate = new Date(o.created_at);
        const yyyy = orderDate.getFullYear();
        const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
        const dd = String(orderDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === date;
      });

      const detailedOrders = await Promise.all(
        filtered.map(async o => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*, product:products!inner(name)')
            .eq('order_id', o.id);

          const itemsWithNames = (items || []).map(item => ({
            ...item,
            product_name: (item.product as unknown as Product)?.name || 'Unknown Product'
          }));

          return { ...o, items: itemsWithNames };
        })
      );

      setOrders(detailedOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const summary: Record<string, { name: string; quantity: number }> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      const key = `${item.product_id}-${item.variant_id || 'base'}`;
      if (!summary[key]) {
        summary[key] = { name: item.product_name, quantity: 0 };
      }
      summary[key].quantity += item.quantity;
    });
  });

  const summaryItems = Object.values(summary).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-noto-serif text-primary">Daily Pick List</h2>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
          >
            <Icon name="print" className="text-sm" />
            Print Pick List
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-8 print:border-none print:p-0 print:bg-surface print:text-black">
          <div className="hidden print:block mb-6 border-b pb-4">
            <h1 className="text-2xl font-serif font-bold uppercase">The Heritage Curator</h1>
            <h2 className="text-lg uppercase mt-1">Daily Pick List - {new Date(date).toLocaleDateString()}</h2>
          </div>

          <h3 className="font-bold uppercase tracking-widest text-sm mb-4 print:text-black text-on-surface-variant">Products to Pick</h3>

          {summaryItems.length === 0 ? (
            <p className="text-sm italic">No pending/processing orders found for this date.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-outline-variant/20 print:border-black">
                  <th className="py-2 font-bold uppercase text-xs tracking-wider">Product Name</th>
                  <th className="py-2 font-bold uppercase text-xs tracking-wider text-right w-24">Total Qty</th>
                  <th className="py-2 font-bold uppercase text-xs tracking-wider text-center w-24 print:table-cell hidden">Picked</th>
                </tr>
              </thead>
              <tbody>
                {summaryItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/10 print:border-gray-300">
                    <td className="py-3 text-sm">{item.name}</td>
                    <td className="py-3 text-sm text-right font-bold">{item.quantity}</td>
                    <td className="py-3 text-center print:table-cell hidden">
                      <div className="w-6 h-6 border-2 border-black inline-block rounded-sm"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {orders.length > 0 && (
            <div className="mt-12 break-before-page">
              <h3 className="font-bold uppercase tracking-widest text-sm mb-4 print:text-black text-on-surface-variant">Orders Included ({orders.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map(o => (
                  <div key={o.id} className="border border-outline-variant/20 print:border-gray-400 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-mono font-bold">{o.order_number}</h4>
                      <span className="text-xs uppercase bg-surface-container px-2 py-0.5 rounded print:border print:border-black">{o.status}</span>
                    </div>
                    <p className="text-sm font-medium">{o.shipping_address?.first_name} {o.shipping_address?.last_name}</p>
                    <div className="mt-2 text-xs space-y-1">
                      {o.items.map(i => (
                        <div key={i.id} className="flex justify-between">
                          <span className="truncate pr-2">{i.product_name}</span>
                          <span className="font-bold shrink-0">x{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}