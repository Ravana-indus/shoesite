import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../../lib/api';
import { formatPriceCents } from '../../../types/database';
import { useOrderContext } from '../../../context/OrderContext';
import { Icon } from '../../ui/Icon';
import type { OrderItem, RefundReason } from '../../../types/database';

interface OrderRefundModalProps {
  orderId: string;
  orderItems: OrderItem[];
  orderTotalCents: number;
  onClose: () => void;
  onRefund: () => void;
}

interface OrderItemWithRefund extends Omit<OrderItem, 'refunded_quantity'> {
  refunded_quantity?: number;
}

interface SelectedItem {
  orderItemId: string;
  quantity: number;
  unitPriceCents: number;
  maxQuantity: number;
}

export function OrderRefundModal({
  orderId,
  orderItems,
  orderTotalCents,
  onClose,
  onRefund,
}: OrderRefundModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { triggerRefresh } = useOrderContext();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [refundShipping, setRefundShipping] = useState(false);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [reason, setReason] = useState<RefundReason>('customer_request');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotalCents = orderItems.reduce((sum, item) => sum + (item.unit_price_cents ?? 0) * item.quantity, 0);
  const shippingCents = orderTotalCents - subtotalCents;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const itemsWithRefund = orderItems as OrderItemWithRefund[];
    const initial: SelectedItem[] = itemsWithRefund.map(item => ({
      orderItemId: item.id,
      quantity: 0,
      unitPriceCents: item.unit_price_cents ?? 0,
      maxQuantity: item.quantity - (item.refunded_quantity ?? 0),
    }));
    setSelectedItems(initial);
    setShippingAmount(shippingCents);
  }, [orderItems, shippingCents]);

  const itemsTotalCents = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0
  );
  const totalRefundCents = itemsTotalCents + (refundShipping ? shippingAmount : 0);

  function handleItemToggle(index: number, checked: boolean) {
    setSelectedItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: checked ? item.maxQuantity : 0 } : item
      )
    );
  }

  function handleQuantityChange(index: number, value: number) {
    const max = selectedItems[index].maxQuantity;
    const qty = Math.max(0, Math.min(max, value));
    setSelectedItems(prev => prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const itemsToRefund = selectedItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        order_item_id: item.orderItemId,
        quantity: item.quantity,
        amount_cents: item.quantity * item.unitPriceCents,
      }));

    if (itemsToRefund.length === 0 && (!refundShipping || shippingAmount === 0)) return;

    setLoading(true);
    try {
      await api.refunds.create(orderId, {
        items: itemsToRefund,
        amount_cents: totalRefundCents,
        reason,
        note: note || undefined,
      });
      triggerRefresh();
      onRefund();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto max-w-lg w-[95vw] bg-surface rounded-2xl border border-outline-variant/10 shadow-2xl backdrop:bg-black/50 overflow-hidden"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <h2 className="text-lg font-noto-serif text-primary">Process Refund</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Line Items</p>
            <div className="space-y-2">
              {orderItems.map((orderItem, index) => {
                const itemWithRefund = orderItem as OrderItemWithRefund;
                const maxQty = itemWithRefund.quantity - (itemWithRefund.refunded_quantity ?? 0);
                const isDisabled = maxQty <= 0;
                const selected = selectedItems[index];
                return (
                  <div
                    key={orderItem.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isDisabled
                        ? 'border-outline-variant/5 bg-surface-container-lowest opacity-50'
                        : 'border-outline-variant/10 bg-surface-container-low'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected?.quantity > 0}
                      disabled={isDisabled}
                      onChange={e => handleItemToggle(index, e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{orderItem.product_name}</p>
                      {orderItem.variant_name && (
                        <p className="text-xs text-on-surface-variant">{orderItem.variant_name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-on-surface-variant">
                          {formatPriceCents(orderItem.unit_price_cents ?? 0)} ea
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          · {maxQty} avail
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={maxQty}
                        value={selected?.quantity ?? 0}
                        disabled={isDisabled}
                        onChange={e => handleQuantityChange(index, parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1.5 text-sm text-center rounded border border-outline-variant/20 bg-surface focus:outline-none focus:border-primary disabled:opacity-50"
                      />
                      <span className="text-sm font-medium w-20 text-right">
                        {formatPriceCents((selected?.quantity ?? 0) * (orderItem.unit_price_cents ?? 0))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Shipping</p>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant/10 bg-surface-container-low cursor-pointer hover:bg-surface-container-high transition-colors">
              <input
                type="checkbox"
                checked={refundShipping}
                onChange={e => setRefundShipping(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant accent-primary"
              />
              <span className="text-sm flex-1">Refund shipping</span>
              <input
                type="number"
                min={0}
                value={shippingAmount}
                disabled={!refundShipping}
                onChange={e => setShippingAmount(parseInt(e.target.value, 10) || 0)}
                className="w-28 px-2 py-1.5 text-sm text-right rounded border border-outline-variant/20 bg-surface focus:outline-none focus:border-primary disabled:opacity-50"
              />
            </label>
            <p className="text-xs text-on-surface-variant px-1">
              Shipping cost: {formatPriceCents(shippingCents)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold block mb-2">
                Reason
              </span>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as RefundReason)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant/20 bg-surface-container-low focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="damaged">Damaged</option>
                <option value="wrong_item">Wrong Item</option>
                <option value="customer_request">Customer Request</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold block mb-2">
                Note (optional)
              </span>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder="Add a note..."
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant/20 bg-surface-container-low focus:outline-none focus:border-primary resize-none"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-sm font-medium">Total Refund</span>
            <span className="text-lg font-noto-serif text-primary">{formatPriceCents(totalRefundCents)}</span>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant/10">
          <button
            type="submit"
            disabled={loading || totalRefundCents <= 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-on-surface rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="animate-spin">
                  <Icon name="loader" className="text-base" />
                </span>
                Processing...
              </>
            ) : (
              <>
                <Icon name="undo" className="text-base" />
                Issue Refund
              </>
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
}
