import { createClient } from '@/utils/supabase/server';
import { formatPriceCents } from '@/lib/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StickerPrint({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, addresses!shipping_address_id(*)')
    .eq('id', id)
    .single();

  if (!order) {
    notFound();
  }

  const shippingAddr = (order as any).addresses_shipping_address_id;

  if (!shippingAddr) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg mb-4">No shipping address found for this order.</p>
        <Link href="/admin/orders" className="text-primary hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto bg-surface text-black font-sans border-2 border-dashed border-gray-300">
      <div className="flex justify-between items-start mb-6 no-print">
        <Link href="/admin/orders" className="text-sm text-primary hover:underline">
          ← Back
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Print
        </button>
      </div>

      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-serif font-bold uppercase tracking-widest">Rituals.lk</h1>
        <p className="text-xs uppercase tracking-widest mt-1">Delivery</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">To:</h2>
          <p className="font-bold text-lg">{shippingAddr.recipient_name}</p>
          <p className="text-base">{shippingAddr.address_line_1}</p>
          {shippingAddr.address_line_2 && <p className="text-base">{shippingAddr.address_line_2}</p>}
          <p className="text-base">{shippingAddr.city}, {shippingAddr.postal_code}</p>
          <p className="text-base">{shippingAddr.country}</p>
        </div>

        {shippingAddr.phone && (
          <div className="pt-4 border-t border-gray-200">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-1">Contact:</h2>
            <p className="text-lg font-bold">{shippingAddr.phone}</p>
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
