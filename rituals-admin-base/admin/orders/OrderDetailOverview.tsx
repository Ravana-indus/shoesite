import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { Order, OrderItem, Address } from '../../../types/database';
import { formatPriceCents } from '../../../types/database';
import { Icon } from '../../ui/Icon';
import { useOrderContext } from '../../../context/OrderContext';

type OrderWithDetails = Order & {
  items: OrderItem[];
  shipping_address: Address | null;
  billing_address: Address | null;
};

interface OrderDetailOverviewProps {
  orderId: string;
  onEditOrder: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
  partially_refunded: 'bg-orange-100 text-orange-800',
};

const FULFILLMENT_COLORS: Record<string, string> = {
  unfulfilled: 'bg-gray-100 text-gray-800',
  partial: 'bg-orange-100 text-orange-800',
  fulfilled: 'bg-green-100 text-green-800',
};

export function OrderDetailOverview({ orderId, onEditOrder }: OrderDetailOverviewProps) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const { triggerRefresh } = useOrderContext();

  useEffect(() => {
    loadOrder();
    loadTags();
    loadAllTags();
  }, [orderId]);

  async function loadOrder() {
    try {
      const data = await api.orders.getById(orderId);
      setOrder(data as OrderWithDetails | null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadTags() {
    try {
      const t = await api.orders.getTags(orderId);
      setTags(t);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAllTags() {
    try {
      const t = await api.orders.getDistinctTags();
      setAllTags(t);
    } catch (e) {
      console.error(e);
    }
  }

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      await api.orders.updateStatus(orderId, status);
      await loadOrder();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  }

  async function updatePaymentStatus(paymentStatus: string) {
    setUpdating(true);
    try {
      await api.orders.updatePaymentStatus(orderId, paymentStatus);
      await loadOrder();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  }

  async function addTag(tag: string) {
    if (!tag.trim()) return;
    try {
      await api.orders.addTag(orderId, tag.trim());
      await loadTags();
      triggerRefresh();
      setTagInput('');
      setTagSuggestions([]);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeTag(tag: string) {
    try {
      await api.orders.removeTag(orderId, tag);
      await loadTags();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  }

  function handleTagInputChange(value: string) {
    setTagInput(value);
    if (value.trim()) {
      const suggestions = allTags.filter(
        t => t.toLowerCase().includes(value.toLowerCase()) && !tags.includes(t)
      );
      setTagSuggestions(suggestions);
    } else {
      setTagSuggestions([]);
    }
  }

  function copyAddress(address: Address | null) {
    if (!address) return;
    const text = `${address.recipient_name}, ${address.address_line_1}, ${address.city}, ${address.district}, ${address.postal_code}, ${address.country}${address.phone ? `, ${address.phone}` : ''}`;
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-on-surface-variant">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-on-surface-variant">
        Order not found
      </div>
    );
  }

  const fulfillmentStatus = order.fulfillment_status || 'unfulfilled';

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Order Status</label>
          <select
            value={order.status ?? 'pending'}
            onChange={e => updateStatus(e.target.value)}
            disabled={updating}
            className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border-0 cursor-pointer font-semibold ${STATUS_COLORS[order.status ?? 'pending']}`}
          >
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Payment Status</label>
          <select
            value={order.payment_status ?? 'pending'}
            onChange={e => updatePaymentStatus(e.target.value)}
            disabled={updating}
            className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border-0 cursor-pointer font-semibold ${PAYMENT_STATUS_COLORS[order.payment_status ?? 'pending']}`}
          >
            {['pending', 'paid', 'failed', 'refunded', 'partially_refunded'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Fulfillment</label>
          <span className={`inline-block text-xs uppercase tracking-wider px-3 py-1.5 rounded-full font-semibold ${FULFILLMENT_COLORS[fulfillmentStatus]}`}>
            {fulfillmentStatus}
          </span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-4">
        <h3 className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Customer</h3>
        <p className="font-medium">{order.email}</p>
        {order.user_id && (
          <a
            href={`/admin/users?userId=${order.user_id}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
          >
            <Icon name="open_in_new" className="text-sm" />
            View customer profile
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {order.shipping_address && (
          <div className="bg-surface-container-low rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-widest text-on-surface-variant">Shipping Address</h3>
              <button
                onClick={() => copyAddress(order.shipping_address)}
                className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
                title="Copy address"
              >
                <Icon name="content_copy" className="text-sm" />
              </button>
            </div>
            <p className="font-medium text-sm">{order.shipping_address.recipient_name}</p>
            <p className="text-xs text-on-surface-variant">{order.shipping_address.address_line_1}</p>
            <p className="text-xs text-on-surface-variant">
              {order.shipping_address.city}, {order.shipping_address.district} {order.shipping_address.postal_code}
            </p>
            <p className="text-xs text-on-surface-variant">{order.shipping_address.country}</p>
            {order.shipping_address.phone && (
              <p className="text-xs text-on-surface-variant mt-1">{order.shipping_address.phone}</p>
            )}
          </div>
        )}
        {order.billing_address && (
          <div className="bg-surface-container-low rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-widest text-on-surface-variant">Billing Address</h3>
              <button
                onClick={() => copyAddress(order.billing_address)}
                className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
                title="Copy address"
              >
                <Icon name="content_copy" className="text-sm" />
              </button>
            </div>
            <p className="font-medium text-sm">{order.billing_address.recipient_name}</p>
            <p className="text-xs text-on-surface-variant">{order.billing_address.address_line_1}</p>
            <p className="text-xs text-on-surface-variant">
              {order.billing_address.city}, {order.billing_address.district} {order.billing_address.postal_code}
            </p>
            <p className="text-xs text-on-surface-variant">{order.billing_address.country}</p>
            {order.billing_address.phone && (
              <p className="text-xs text-on-surface-variant mt-1">{order.billing_address.phone}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                <th className="text-left py-2 pr-4 font-medium">Product</th>
                <th className="text-left py-2 pr-4 font-medium">Variant</th>
                <th className="text-right py-2 pr-4 font-medium">Qty</th>
                <th className="text-right py-2 pr-4 font-medium">Unit Price</th>
                <th className="text-right py-2 pr-4 font-medium">Total</th>
                <th className="text-right py-2 pr-4 font-medium">Fulfilled</th>
                <th className="text-right py-2 font-medium">Refunded</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="border-b border-outline-variant/5">
                  <td className="py-3 pr-4">{item.product_name}</td>
                  <td className="py-3 pr-4 text-on-surface-variant">{item.variant_name || '—'}</td>
                  <td className="py-3 pr-4 text-right">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right">{formatPriceCents(item.unit_price_cents)}</td>
                  <td className="py-3 pr-4 text-right font-medium">{formatPriceCents(item.total_cents)}</td>
                  <td className="py-3 pr-4 text-right text-on-surface-variant">{item.fulfilled_quantity ?? 0}</td>
                  <td className="py-3 text-right text-on-surface-variant">{item.refunded_quantity ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={onEditOrder}
          className="mt-4 w-full px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Edit Order
        </button>
      </div>

      <div className="bg-surface-container-low rounded-xl p-4">
        <h3 className="text-xs uppercase tracking-widest text-on-surface-variant mb-3">Order Totals</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Subtotal</span>
            <span>{formatPriceCents(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Shipping</span>
            <span>{formatPriceCents(order.shipping_cents ?? 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Tax</span>
            <span>{formatPriceCents(order.tax_cents ?? 0)}</span>
          </div>
          {order.discount_cents ? (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPriceCents(order.discount_cents)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold text-lg border-t border-outline-variant/10 pt-2 mt-2">
            <span>Total</span>
            <span className="text-primary">{formatPriceCents(order.total_cents)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Tags</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-high rounded-full text-xs"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="p-0.5 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
              >
                <Icon name="close" className="text-xs" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={tagInput}
              onChange={e => handleTagInputChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Add a tag..."
              className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-outline-variant/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {tagSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-surface-container-high rounded-lg border border-outline-variant/10 shadow-lg overflow-hidden">
                {tagSuggestions.slice(0, 5).map(suggestion => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-container-low transition-colors"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => addTag(tagInput)}
            disabled={!tagInput.trim()}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
