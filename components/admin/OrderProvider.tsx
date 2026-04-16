'use client';

import { createContext, useContext, useState } from 'react';

interface OrderContextValue {
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const OrderContext = createContext<OrderContextValue>({
  selectedOrderId: null,
  setSelectedOrderId: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(n => n + 1);

  return (
    <OrderContext.Provider value={{ selectedOrderId, setSelectedOrderId, refreshTrigger, triggerRefresh }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  return useContext(OrderContext);
}