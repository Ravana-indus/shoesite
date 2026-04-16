import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Order, Address } from '../../types/database';
import { formatPriceCents } from '../../types/database';

type OrderDetail = Order & { shipping_address: Address | null };

export default function StickerPrint() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (id) {
      api.orders.getById(id).then(data => {
        setOrder(data as OrderDetail | null);
        setTimeout(() => window.print(), 500);
      });
    }
  }, [id]);

  if (!order || !order.shipping_address) return <div className="p-8">Loading Sticker...</div>;

  return (
    <div className="p-4 max-w-sm mx-auto bg-surface text-black font-sans border-2 border-dashed border-gray-300">
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-serif font-bold uppercase tracking-widest">Rituals.lk</h1>
        <p className="text-xs uppercase tracking-widest mt-1">Delivery</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">To:</h2>
          <p className="font-bold text-lg">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
          <p className="text-base">{order.shipping_address.address_line_1}</p>
          {order.shipping_address.address_line_2 && <p className="text-base">{order.shipping_address.address_line_2}</p>}
          <p className="text-base">{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
          <p className="text-base">{order.shipping_address.country}</p>
        </div>

        {order.shipping_address.phone && (
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">Contact:</h2>
            <p className="text-lg font-bold">{order.shipping_address.phone}</p>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
          <div>
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">Order Ref:</h2>
            <p className="font-mono font-bold">{order.order_number}</p>
          </div>
          {order.payment_method === 'cod' && (
            <div className="border-2 border-black px-2 py-1 text-center">
              <p className="font-bold uppercase text-xs">COD Amount</p>
              <p className="font-bold">{formatPriceCents(order.total_cents)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
