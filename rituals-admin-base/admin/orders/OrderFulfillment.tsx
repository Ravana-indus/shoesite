import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { OrderFulfillment, OrderFulfillmentItem, OrderItem, FulfillmentStatus } from '../../../types/database';
import { Icon } from '../../ui/Icon';
import { useOrderContext } from '../../../context/OrderContext';

interface OrderFulfillmentProps {
  orderId: string;
}

type FulfillmentWithItems = OrderFulfillment & {
  items: (OrderFulfillmentItem & { order_item: OrderItem })[];
};

const CARRIERS = ['SL Post', 'DHL', 'FedEx', 'UPS', 'Other'] as const;

const FULFILLMENT_BADGE_COLORS: Record<FulfillmentStatus, string> = {
  unfulfilled: 'bg-gray-100 text-gray-700',
  partial: 'bg-orange-100 text-orange-700',
  fulfilled: 'bg-green-100 text-green-700',
};

const RECORD_STATUS_BADGE_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
};

export default function OrderFulfillment({ orderId }: OrderFulfillmentProps) {
  const { triggerRefresh } = useOrderContext();
  const [fulfillments, setFulfillments] = useState<FulfillmentWithItems[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>('unfulfilled');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, [orderId]);

  async function loadData() {
    setLoading(true);
    try {
      const [fulfillmentsData, orderData] = await Promise.all([
        api.fulfillments.getByOrder(orderId),
        api.orders.getById(orderId),
      ]);
      setFulfillments(fulfillmentsData as FulfillmentWithItems[]);
      setOrderItems(orderData?.items ?? []);
      const status = (orderData as { fulfillment_status?: FulfillmentStatus })?.fulfillment_status ?? 'unfulfilled';
      setFulfillmentStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const unfulfilledItems = orderItems.filter(item => {
    const fulfilled = item.fulfilled_quantity ?? 0;
    return fulfilled < item.quantity;
  });

  function toggleItem(itemId: string) {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        const item = unfulfilledItems.find(i => i.id === itemId);
        next[itemId] = item ? item.quantity - (item.fulfilled_quantity ?? 0) : 1;
      }
      return next;
    });
  }

  function setItemQty(itemId: string, qty: number) {
    setSelectedItems(prev => ({ ...prev, [itemId]: Math.max(1, qty) }));
  }

  async function handleAddTracking(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim() || Object.keys(selectedItems).length === 0) return;

    setSubmitting(true);
    try {
      await api.fulfillments.create(orderId, {
        tracking_number: trackingNumber.trim(),
        carrier: carrier || undefined,
        items: Object.entries(selectedItems).map(([order_item_id, quantity]) => ({
          order_item_id,
          quantity: quantity as number,
        })),
      });
      setTrackingNumber('');
      setCarrier('');
      setSelectedItems({});
      await loadData();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function markAsShipped(fulfillmentId: string) {
    try {
      await api.fulfillments.update(fulfillmentId, {
        status: 'in_transit',
        shipped_at: new Date().toISOString(),
      });
      await loadData();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function markAsDelivered(fulfillmentId: string) {
    try {
      await api.fulfillments.update(fulfillmentId, {
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      });
      await loadData();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-on-surface-variant">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-on-surface-variant">Fulfillment</span>
        <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${FULFILLMENT_BADGE_COLORS[fulfillmentStatus]}`}>
          {fulfillmentStatus}
        </span>
      </div>

      {fulfillments.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Fulfillment Records</p>
          {fulfillments.map(f => (
            <div key={f.id} className="bg-surface-container-low rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {f.tracking_number && (
                    <>
                      <Icon name="local_shipping" className="text-sm text-on-surface-variant" />
                      <span className="text-sm font-mono">{f.tracking_number}</span>
                    </>
                  )}
                  {f.carrier && (
                    <span className="text-xs text-on-surface-variant">via {f.carrier}</span>
                  )}
                </div>
                <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${RECORD_STATUS_BADGE_COLORS[f.status]}`}>
                  {f.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1">
                {f.items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">
                      {item.order_item?.product_name ?? 'Unknown'} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                {f.shipped_at && <span>Shipped: {new Date(f.shipped_at).toLocaleString('en-LK')}</span>}
                {f.delivered_at && <span>Delivered: {new Date(f.delivered_at).toLocaleString('en-LK')}</span>}
              </div>

              <div className="flex gap-2 pt-1">
                {f.status === 'pending' && (
                  <button
                    onClick={() => markAsShipped(f.id)}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                {f.status !== 'delivered' && (
                  <button
                    onClick={() => markAsDelivered(f.id)}
                    className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {unfulfilledItems.length > 0 && (
        <form onSubmit={handleAddTracking} className="space-y-4 bg-surface-container-low rounded-lg p-4">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Add Tracking</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface rounded border border-outline-variant/30 focus:outline-none focus:border-primary"
                placeholder="ABC123456"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Carrier</label>
              <select
                value={carrier}
                onChange={e => setCarrier(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface rounded border border-outline-variant/30 focus:outline-none focus:border-primary"
              >
                <option value="">Select carrier</option>
                {CARRIERS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-2">Unfulfilled Items</label>
            <div className="space-y-2">
              {unfulfilledItems.map(item => {
                const remaining = item.quantity - (item.fulfilled_quantity ?? 0);
                const checked = !!selectedItems[item.id];
                return (
                  <div key={item.id} className="flex items-center gap-3 bg-surface rounded p-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="flex-1 text-sm truncate">{item.product_name}</span>
                    <span className="text-xs text-on-surface-variant">{remaining} remaining</span>
                    {checked && (
                      <input
                        type="number"
                        min={1}
                        max={remaining}
                        value={selectedItems[item.id]}
                        onChange={e => setItemQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-sm text-right bg-surface rounded border border-outline-variant/30 focus:outline-none focus:border-primary"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !trackingNumber.trim() || Object.keys(selectedItems).length === 0}
            className="w-full py-2 text-sm bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add Fulfillment'}
          </button>
        </form>
      )}

      {fulfillments.length === 0 && unfulfilledItems.length === 0 && (
        <p className="text-sm text-on-surface-variant text-center py-8">No fulfillment data available.</p>
      )}
    </div>
  );
}
