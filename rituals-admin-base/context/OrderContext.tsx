import React, { createContext, useContext, useState } from 'react';

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

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger(n => n + 1);

  return (
    <OrderContext.Provider value={{ selectedOrderId, setSelectedOrderId, refreshTrigger, triggerRefresh }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => useContext(OrderContext);
