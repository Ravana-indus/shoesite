import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../lib/api';
import type { Order, FulfillmentStatus, OrderStatus } from '../../../types/database';
import { Icon } from '../../ui/Icon';
import { formatPriceCents } from '../../../types/database';

export function FulfillmentDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatus | 'all'>('unfulfilled');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkCarrier, setBulkCarrier] = useState<string>('');
  const [performingBulk, setPerformingBulk] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await api.orders.search(
        {},
        { page: 1, per_page: 500, sort_by: 'created_at', sort_dir: 'desc' }
      );

      // Initially, we want to bring in orders that need fulfillment
      // Excluding cancelled, refunded, pending (unless we want pending orders to be fulfilled, usually confirmed/processing)
      const toFulfill = res.data.filter(o =>
        o.status !== 'cancelled' &&
        o.status !== 'refunded'
      );

      // Fetch items for these orders to display in the print view
      const detailedOrders = await Promise.all(
        toFulfill.map(async o => {
          const detail = await api.orders.getById(o.id);
          return detail || o;
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

  // Exports
  async function downloadCSV() {
    if (filteredOrders.length === 0) return;
    try {
      setPerformingBulk(true);
      // Fetch full details for selected or all filtered to get shipping addresses
      const idsToFetch = selectedOrderIds.size > 0 ? Array.from(selectedOrderIds) : filteredOrders.map(o => o.id);
      const detailedOrders = await Promise.all(idsToFetch.map(id => api.orders.getById(id)));

      let csv = 'Order Number,Date,Customer Email,Customer Name,Shipping Address,City,Phone,Total,Status\n';

      detailedOrders.forEach(o => {
        if (!o) return;
        const name = `${o.shipping_address?.first_name || ''} ${o.shipping_address?.last_name || ''}`.trim();
        const address = `${o.shipping_address?.address_line1 || ''} ${o.shipping_address?.address_line2 || ''}`.trim().replace(/,/g, ' ');
        const city = o.shipping_address?.city || '';
        const phone = o.shipping_address?.phone || '';
        const total = (o.total_cents / 100).toFixed(2);

        csv += `${o.order_number},${new Date(o.created_at).toLocaleDateString()},${o.email},${name},${address},${city},${phone},${total},${o.fulfillment_status}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `shipping-manifest-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert('Error generating CSV');
    } finally {
      setPerformingBulk(false);
    }
  }

  function printManifest() {
    window.print();
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
          await api.orders.updateStatus(id, 'shipped');
        }
      } else if (bulkAction === 'mark_delivered') {
        for (const id of selectedOrderIds) {
          await api.orders.updateStatus(id, 'delivered');
        }
      } else if (bulkAction === 'fulfill') {
        for (const id of selectedOrderIds) {
          const orderData = await api.orders.getById(id);
          if (!orderData) continue;
          const itemsToFulfill = orderData.items.filter(i => (i.fulfilled_quantity ?? 0) < i.quantity).map(i => ({
            order_item_id: i.id,
            quantity: i.quantity - (i.fulfilled_quantity ?? 0)
          }));
          if (itemsToFulfill.length > 0) {
            await api.fulfillments.create(id, {
              carrier: bulkCarrier || undefined,
              items: itemsToFulfill
            });
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
      {/* Top Bar with Filters */}
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
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/10 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Fulfillments</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="partial">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
        <div className="flex items-center gap-2 no-print shrink-0">
          <button
            onClick={downloadCSV}
            disabled={performingBulk || filteredOrders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Icon name="download" className="text-sm" />
            CSV Manifest
          </button>
          <button
            onClick={printManifest}
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Icon name="print" className="text-sm" />
            Print List
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
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

      {/* Orders Table */}
      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant/10">
              <tr>
                <th className="px-4 py-3 w-12 no-print">
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
                  <React.Fragment key={order.id}>
                  <tr className="border-b border-outline-variant/5 hover:bg-surface-container-low/50">
                    <td className="px-4 py-3 no-print">
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
                        {order.fulfillment_status}
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
                  {order.items && order.items.length > 0 && (
                    <tr className="hidden print:table-row bg-surface-container-lowest border-b-2 border-black">
                      <td colSpan={7} className="px-8 py-4">
                        <div className="text-sm font-bold mb-2 uppercase tracking-widest text-black">Items to Fulfill:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {order.items.map((item: any) => (
                            <li key={item.id} className="text-sm text-black">
                              <span className="font-semibold">{item.quantity}x</span> {item.product_name}
                              {item.variant_name && <span className="text-gray-600 ml-1">({item.variant_name})</span>}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
