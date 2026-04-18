import { createClient } from '@/utils/supabase/server';
import { formatPriceCents } from '@/lib/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoicePrint({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*), addresses!shipping_address_id(*), addresses!billing_address_id(*)')
    .eq('id', id)
    .single();

  if (!order) {
    notFound();
  }

  const items = order.order_items || [];

  return (
    <div className="p-8 max-w-4xl mx-auto bg-surface text-black font-sans">
      <div className="flex justify-between items-start mb-12 border-b pb-8 no-print">
        <div>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            ← Back to Orders
          </Link>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Print Invoice
        </button>
      </div>

      <div className="flex justify-between items-start mb-12 border-b pb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Rituals.lk</h1>
          <p className="text-sm text-gray-600">Colombo, Sri Lanka</p>
          <p className="text-sm text-gray-600">hello@theheritagecurator.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-sm font-mono mt-1 text-gray-600">#{order.order_number}</p>
          <p className="text-sm text-gray-600 mt-2">
            Date: {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">Bill To:</h3>
          <div className="text-sm">
            <p className="font-bold">{order.email}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500">Ship To:</h3>
          {(order as any).addresses_shipping_address_id && (
            <div className="text-sm">
              <p className="font-bold">
                {(order as any).addresses_shipping_address_id.recipient_name}
              </p>
              <p>{(order as any).addresses_shipping_address_id.address_line_1}</p>
              {(order as any).addresses_shipping_address_id.address_line_2 && (
                <p>{(order as any).addresses_shipping_address_id.address_line_2}</p>
              )}
              <p>
                {(order as any).addresses_shipping_address_id.city}, {(order as any).addresses_shipping_address_id.postal_code}
              </p>
              <p>{(order as any).addresses_shipping_address_id.country}</p>
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
          {items.map((item: any, idx: number) => (
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
          {(order.discount_cents ?? 0) > 0 && (
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
