import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../../lib/api';
import { useOrderContext } from '../../../context/OrderContext';
import { Icon } from '../../ui/Icon';
import { OrderDetailOverview } from './OrderDetailOverview';
import OrderFulfillment from './OrderFulfillment';
import OrderPayment from './OrderPayment';
import { OrderTimeline } from './OrderTimeline';
import { OrderRefundModal } from './OrderRefundModal';
import { OrderEditModal } from './OrderEditModal';
import type { Order, OrderItem, Address } from '../../../types/database';

type OrderDetail = Order & { items: OrderItem[]; shipping_address: Address | null; billing_address: Address | null };

type Tab = 'details' | 'fulfillment' | 'payment' | 'timeline';

export function OrderDrawer() {
  const { selectedOrderId, setSelectedOrderId } = useOrderContext();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selectedOrderId) {
      dialogRef.current?.showModal();
      loadOrder(selectedOrderId);
    } else {
      dialogRef.current?.close();
    }
  }, [selectedOrderId]);

  async function loadOrder(id: string) {
    setLoading(true);
    try {
      const data = await api.orders.getById(id);
      setOrder(data as OrderDetail | null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSelectedOrderId(null);
    setActiveTab('details');
    setShowRefundModal(false);
    setShowEditModal(false);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === dialogRef.current) handleClose();
  }

  if (!selectedOrderId) return null;

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={handleBackdropClick}
        className="fixed inset-0 m-auto max-w-2xl w-[95vw] h-[90vh] bg-surface rounded-2xl border border-outline-variant/10 shadow-2xl backdrop:bg-black/50 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant">Loading...</div>
        ) : !order ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant">Order not found</div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 sticky top-0 bg-surface z-10">
              <div>
                <h2 className="text-xl font-noto-serif text-primary">{order.order_number}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {order.created_at ? new Date(order.created_at).toLocaleString('en-LK') : '—'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => window.open(`/admin/print/invoice/${order.id}`, '_blank')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Print Invoice">
                  <Icon name="receipt" className="text-lg" />
                </button>
                <button onClick={() => window.open(`/admin/print/sticker/${order.id}`, '_blank')} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Print Sticker">
                  <Icon name="local_shipping" className="text-lg" />
                </button>
                <button onClick={handleClose} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors">
                  <Icon name="close" className="text-lg" />
                </button>
              </div>
            </div>

            <div className="border-b border-outline-variant/10">
              <div className="flex px-6">
                {(['details', 'fulfillment', 'payment', 'timeline'] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm capitalize transition-colors border-b-2 ${
                      activeTab === tab
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              {activeTab === 'details' && (
                <OrderDetailOverview
                  orderId={order.id}
                  onEditOrder={() => setShowEditModal(true)}
                />
              )}
              {activeTab === 'fulfillment' && (
                <OrderFulfillment orderId={order.id} />
              )}
              {activeTab === 'payment' && (
                <OrderPayment
                  orderId={order.id}
                  onRefund={() => setShowRefundModal(true)}
                />
              )}
              {activeTab === 'timeline' && (
                <OrderTimeline orderId={order.id} />
              )}
            </div>
          </>
        )}
      </dialog>

      {showRefundModal && order && (
        <OrderRefundModal
          orderId={order.id}
          orderItems={order.items}
          orderTotalCents={order.total_cents}
          onClose={() => setShowRefundModal(false)}
          onRefund={() => {
            setShowRefundModal(false);
            loadOrder(order.id);
          }}
        />
      )}

      {showEditModal && order && (
        <OrderEditModal
          orderId={order.id}
          items={order.items}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            loadOrder(order.id);
          }}
        />
      )}
    </>
  );
}
