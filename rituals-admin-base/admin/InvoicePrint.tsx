import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Order, OrderItem, Address } from '../../types/database';
import { formatPriceCents } from '../../types/database';

type OrderDetail = Order & { items: OrderItem[]; shipping_address: Address | null; billing_address: Address | null };

export default function InvoicePrint() {
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

  if (!order) return <div className="p-8">Loading Invoice...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-surface text-black font-sans">
      <div className="flex justify-between items-start mb-12 border-b pb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Rituals.lk</h1>
          <p className="text-sm text-gray-600">Colombo, Sri Lanka</p>
          <p className="text-sm text-gray-600">hello@theheritagecurator.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-sm font-mono mt-1 text-gray-600">#{order.order_number}</p>
          <p className="text-sm text-gray-600 mt-2">Date: {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">Bill To:</h3>
          {order.billing_address ? (
            <div className="text-sm">
              <p className="font-bold">{order.billing_address.first_name} {order.billing_address.last_name}</p>
              <p>{order.billing_address.address_line_1}</p>
              {order.billing_address.address_line_2 && <p>{order.billing_address.address_line_2}</p>}
              <p>{order.billing_address.city}, {order.billing_address.postal_code}</p>
              <p>{order.billing_address.country}</p>
            </div>
          ) : (
            <div className="text-sm">
              <p className="font-bold">{order.first_name} {order.last_name}</p>
              <p>{order.email}</p>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">Ship To:</h3>
          {order.shipping_address && (
            <div className="text-sm">
              <p className="font-bold">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p>{order.shipping_address.address_line_1}</p>
              {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && <p>Tel: {order.shipping_address.phone}</p>}
            </div>
          )}
        </div>
      </div>

      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Item</th>
            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Qty</th>
            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Price</th>
            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-4 text-sm">{item.product_name}</td>
              <td className="py-4 text-sm text-right">{item.quantity}</td>
              <td className="py-4 text-sm text-right">{formatPriceCents(item.unit_price_cents)}</td>
              <td className="py-4 text-sm text-right">{formatPriceCents(item.total_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatPriceCents(order.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping:</span>
            <span>{formatPriceCents(order.shipping_cents ?? 0)}</span>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>-{formatPriceCents(order.discount_cents)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-3">
            <span>Total:</span>
            <span>{formatPriceCents(order.total_cents)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t text-center text-sm text-gray-500">
        <p>Thank you for shopping with Rituals.lk!</p>
        <p className="mt-1">For any inquiries, please contact us at support@theheritagecurator.com</p>
      </div>
    </div>
  );
}
