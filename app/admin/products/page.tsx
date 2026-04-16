import { createClient } from '@/utils/supabase/server';
import { formatPriceCents } from '@/lib/types/database';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from('products')
    .select('*, brands(name), categories(name), product_images(url)')
    .order('created_at', { ascending: false });

  const productsList = products || [];

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Products</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {productsList.length} products total
          </p>
        </div>
        <Link href="/admin" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
          <Icon name="arrow_back" className="text-sm" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Product</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Brand</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Category</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Status</th>
                <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Price</th>
                <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {productsList.map(product => {
                const image = product.product_images?.[0];
                return (
                  <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {image?.url && (
                          <img src={image.url} alt="" className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <span className="font-medium text-sm">{product.name}</span>
                          <p className="text-xs text-on-surface-variant">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {(product as any).brands?.name || '-'}
                    </td>
                    <td className="p-4 text-sm">
                      {(product as any).categories?.name || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {formatPriceCents(product.price_cents)}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-medium ${
                        (product.stock_qty ?? 0) < 5 ? 'text-error' : 
                        (product.stock_qty ?? 0) < (product.low_stock_threshold ?? 5) ? 'text-tertiary' : ''
                      }`}>
                        {product.stock_qty ?? 0}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {productsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    No products yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}