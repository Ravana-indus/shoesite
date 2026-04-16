import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Order, Product } from '../../types/database';
import { formatPriceCents } from '../../types/database';
import { Icon } from '../../components/ui/Icon';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.orders.getAll().catch(() => []),
      api.products.getLowStock().catch(() => []),
    ]).then(([ordersData, stockData]) => {
      setOrders(ordersData);
      setLowStock(stockData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthOrders = orders.filter(o => o.created_at && new Date(o.created_at) >= startOfMonth);
  const prevMonthOrders = orders.filter(o => o.created_at && new Date(o.created_at) >= startOfPrevMonth && new Date(o.created_at) <= endOfPrevMonth);

  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_cents : 0), 0);
  const prevMonthRevenue = prevMonthOrders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total_cents : 0), 0);
  const revenueChange = prevMonthRevenue > 0 ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const paidOrders = orders.filter(o => o.payment_status === 'paid').length;
  const todayOrders = orders.filter(o => o.created_at && new Date(o.created_at).toDateString() === now.toDateString()).length;

  const statusBreakdown = orders.reduce((acc, o) => {
    acc[o.status ?? 'unknown'] = (acc[o.status ?? 'unknown'] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Admin Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Welcome to Rituals.lk management console</p>
        </div>
        <Link to="/" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
          <Icon name="arrow_back" className="text-sm" />
          View Store
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 flex items-center justify-center">
              <Icon name="payments" className="text-tertiary" />
            </div>
            <span className="text-xs uppercase tracking-widest text-on-surface-variant">This Month</span>
          </div>
          <p className="text-2xl font-bold font-noto-serif">{formatPriceCents(thisMonthRevenue)}</p>
          {revenueChange !== 0 && (
            <p className={`text-xs mt-1 ${revenueChange > 0 ? 'text-green-600' : 'text-error'}`}>
              {revenueChange > 0 ? '+' : ''}{revenueChange}% vs last month
            </p>
          )}
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center">
              <Icon name="receipt_long" className="text-secondary" />
            </div>
            <span className="text-xs uppercase tracking-widest text-on-surface-variant">Orders Today</span>
          </div>
          <p className="text-2xl font-bold font-noto-serif">{todayOrders}</p>
          <p className="text-xs text-on-surface-variant mt-1">{pendingOrders} pending</p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center">
              <Icon name="shopping_bag" className="text-primary" />
            </div>
            <span className="text-xs uppercase tracking-widest text-on-surface-variant">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold font-noto-serif">{formatPriceCents(paidOrders > 0 ? orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_cents, 0) : 0)}</p>
          <p className="text-xs text-on-surface-variant mt-1">{paidOrders} paid orders</p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-error-container/30 flex items-center justify-center">
              <Icon name="warning" className="text-error" />
            </div>
            <span className="text-xs uppercase tracking-widest text-on-surface-variant">Low Stock</span>
          </div>
          <p className="text-2xl font-bold font-noto-serif">{lowStock.length}</p>
          <p className="text-xs text-on-surface-variant mt-1">Products need restocking</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/10">
          <h2 className="font-noto-serif text-base">Order Status Overview</h2>
        </div>
        <div className="p-4 flex gap-4 flex-wrap">
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <span className="text-xs capitalize text-on-surface-variant">{status}</span>
              <span className="text-sm font-semibold">{count}</span>
            </div>
          ))}
          {Object.keys(statusBreakdown).length === 0 && (
            <p className="text-xs text-on-surface-variant">No orders yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
            <h2 className="font-noto-serif text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-secondary uppercase tracking-widest hover:text-primary">View All</Link>
          </div>
          <div className="divide-y divide-outline-variant/5">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div>
                  <p className="font-mono text-xs font-bold text-primary">{order.order_number}</p>
                  <p className="text-xs text-on-surface-variant">{order.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatPriceCents(order.total_cents)}</p>
                  <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant text-sm">No orders yet</div>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
            <h2 className="font-noto-serif text-lg">Low Stock Alerts</h2>
            <Link to="/admin/products" className="text-xs text-secondary uppercase tracking-widest hover:text-primary">Manage</Link>
          </div>
          <div className="divide-y divide-outline-variant/5">
            {lowStock.slice(0, 5).map(product => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-on-surface-variant">SKU: {product.sku ?? 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-tertiary">{product.stock_qty ?? 0} left</p>
                  <p className="text-xs text-on-surface-variant">Threshold: {product.low_stock_threshold ?? 5}</p>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant text-sm">All products well-stocked</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
