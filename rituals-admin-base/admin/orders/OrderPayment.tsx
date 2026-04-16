import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { Order, OrderRefund, OrderRefundItem, OrderItem } from '../../../types/database';
import { formatPriceCents } from '../../../types/database';
import { useOrderContext } from '../../../context/OrderContext';
import { Icon } from '../../ui/Icon';

interface OrderPaymentProps {
  orderId: string;
  onRefund: () => void;
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-red-100 text-red-800',
  partially_refunded: 'bg-orange-100 text-orange-800',
};

const REASON_COLORS: Record<string, string> = {
  damaged: 'bg-red-100 text-red-800',
  wrong_item: 'bg-orange-100 text-orange-800',
  customer_request: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

const STATUS_COLORS: Record<string, string> = {
  processed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

export default function OrderPayment({ orderId, onRefund }: OrderPaymentProps) {
  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null);
  const [refunds, setRefunds] = useState<(OrderRefund & { items: OrderRefundItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const { triggerRefresh } = useOrderContext();

  useEffect(() => {
    Promise.all([
      api.orders.getById(orderId),
      api.refunds.getByOrder(orderId),
    ]).then(([orderData, refundsData]) => {
      setOrder(orderData as (Order & { items: OrderItem[] }) | null);
      setRefunds(refundsData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="p-6 text-center text-on-surface-variant">Loading...</div>;
  }

  if (!order) {
    return <div className="p-6 text-center text-on-surface-variant">Order not found</div>;
  }

  const getProductName = (orderItemId: string): string => {
    const item = order.items.find(i => i.id === orderItemId);
    return item?.product_name ?? 'Unknown Item';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Payment Status</p>
          <span className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded-full font-semibold ${PAYMENT_STATUS_COLORS[order.payment_status ?? 'pending']}`}>
            {order.payment_status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Payment Details</p>
        <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Payment Method</span>
            <span className="font-medium">{order.payment_method ?? '—'}</span>
          </div>
          {order.payhere_payment_id && (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">PayHere Payment ID</span>
              <span className="font-mono text-xs">{order.payhere_payment_id}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Amount Breakdown</p>
        <div className="bg-surface-container-low rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span>{formatPriceCents(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Shipping</span>
            <span>{formatPriceCents(order.shipping_cents ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Tax</span>
            <span>{formatPriceCents(order.tax_cents ?? 0)}</span>
          </div>
          {order.discount_cents ? (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Discount</span>
              <span className="text-green-600">-{formatPriceCents(order.discount_cents)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-outline-variant/10">
            <span>Total</span>
            <span className="font-noto-serif text-primary">{formatPriceCents(order.total_cents)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Refund History</p>
        {refunds.length === 0 ? (
          <div className="bg-surface-container-low rounded-lg p-4 text-center text-sm text-on-surface-variant">
            No refunds issued
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Amount</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Items</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Reason</th>
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map(refund => (
                  <tr key={refund.id} className="border-b border-outline-variant/5">
                    <td className="py-2.5 px-3">{new Date(refund.created_at).toLocaleDateString('en-LK')}</td>
                    <td className="py-2.5 px-3 font-medium">{formatPriceCents(refund.amount_cents)}</td>
                    <td className="py-2.5 px-3 text-on-surface-variant">
                      {refund.items.map(item => getProductName(item.order_item_id)).join(', ')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${REASON_COLORS[refund.reason]}`}>
                        {refund.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[refund.status]}`}>
                        {refund.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-outline-variant/10">
        <button
          onClick={onRefund}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          <Icon name="undo" className="text-base" />
          Issue Refund
        </button>
      </div>
    </div>
  );
}
