import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Order } from '../../types/database';
import { formatPriceCents } from '../../types/database';

const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Analytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.orders.getAll();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Calculate Analytics Metrics
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_cents, 0);
  const totalSubtotal = paidOrders.reduce((sum, o) => sum + o.subtotal_cents, 0);
  const totalShipping = paidOrders.reduce((sum, o) => sum + (o.shipping_cents || 0), 0);
  const totalDiscounts = paidOrders.reduce((sum, o) => sum + (o.discount_cents || 0), 0);

  const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Revenue by Payment Method
  const revenueByMethod = paidOrders.reduce((acc, o) => {
    const method = o.payment_method || 'unknown';
    acc[method] = (acc[method] || 0) + o.total_cents;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-noto-serif text-primary">Analytics & Pricing</h1>
        <p className="text-sm text-on-surface-variant mt-1">Financial overview based on all paid orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Total Revenue (Paid)</p>
          <p className="text-3xl font-bold font-noto-serif text-primary">{formatPriceCents(totalRevenue)}</p>
          <p className="text-xs text-on-surface-variant mt-2">{paidOrders.length} successful orders</p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Avg. Order Value (AOV)</p>
          <p className="text-3xl font-bold font-noto-serif text-secondary">{formatPriceCents(averageOrderValue)}</p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Total Discounts Given</p>
          <p className="text-3xl font-bold font-noto-serif text-error">{formatPriceCents(totalDiscounts)}</p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Total Shipping Collected</p>
          <p className="text-3xl font-bold font-noto-serif text-tertiary">{formatPriceCents(totalShipping)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h2 className="font-noto-serif text-lg">Revenue Breakdown</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/5">
              <span className="text-sm text-on-surface-variant">Product Subtotals</span>
              <span className="font-bold">{formatPriceCents(totalSubtotal)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/5">
              <span className="text-sm text-on-surface-variant">Shipping Fees</span>
              <span className="font-bold text-tertiary">+{formatPriceCents(totalShipping)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/5">
              <span className="text-sm text-on-surface-variant">Discounts Applied</span>
              <span className="font-bold text-error">-{formatPriceCents(totalDiscounts)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold uppercase tracking-widest">Net Revenue</span>
              <span className="font-bold text-lg text-primary">{formatPriceCents(totalRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h2 className="font-noto-serif text-lg">Revenue by Payment Method</h2>
          </div>
          <div className="p-6">
            {Object.keys(revenueByMethod).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No paid orders yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(revenueByMethod).map(([method, amount]) => (
                  <div key={method} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon name={method === 'payhere' ? 'credit_card' : method === 'bank_transfer' ? 'account_balance' : 'payments'} className="text-on-surface-variant" />
                      <span className="text-sm uppercase tracking-wider">{method.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold block">{formatPriceCents(amount as number)}</span>
                      <span className="text-xs text-on-surface-variant">{Math.round(((amount as number) / totalRevenue) * 100)}% of total</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
