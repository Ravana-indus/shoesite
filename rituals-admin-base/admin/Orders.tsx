import React from 'react';
import { Icon } from '../../components/ui/Icon';
import { OrderList } from '../../components/admin/orders/OrderList';
import { OrderDrawer } from '../../components/admin/orders/OrderDrawer';
import { useOrderContext } from '../../context/OrderContext';

export default function AdminOrders() {
  const { selectedOrderId } = useOrderContext();

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Orders</h1>
        </div>
      </div>

      <OrderList />
      {selectedOrderId && <OrderDrawer />}
    </div>
  );
}
