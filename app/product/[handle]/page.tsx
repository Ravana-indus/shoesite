import { getProductBySlug } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { AddToCartForm } from '@/components/product/AddToCartForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { formatPriceCents } from '@/lib/types/database';

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const { handle } = await props.params;

  const product = await getProductBySlug(handle);

  if (!product) {
    return notFound();
  }

  const price = product.price_cents;
  const originalPrice = product.compare_at_price_cents;
  const hasDiscount = originalPrice && originalPrice > price;

  const images = product.product_images || [];
  const variants = product.product_variants || [];

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-3/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.length > 0 ? (
                images.map((img, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-sm overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.alt_text || product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))
              ) : (
                <div className="relative aspect-square bg-gray-100 rounded-sm col-span-2 overflow-hidden flex justify-center items-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-col border-b border-gray-100 pb-8">
              <div className="flex gap-2 mb-4">
                {product.is_featured && <Badge variant="new">FEATURED</Badge>}
                {product.stock_qty === 0 && <Badge variant="new" className="bg-red-100 text-red-800">OUT OF STOCK</Badge>}
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tighter leading-none mb-4">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                  {product.brand.name}
                </p>
              )}
              
              <div className="flex items-center gap-4">
                <span className="font-body text-2xl font-bold">{formatPriceCents(price)}</span>
                {hasDiscount && (
                  <>
                    <span className="font-body text-lg text-gray-400 line-through decoration-1">{formatPriceCents(originalPrice)}</span>
                    <span className="font-display font-semibold text-red-600 uppercase tracking-widest text-sm">
                       Sale
                    </span>
                  </>
                )}
              </div>
            </div>

<AddToCartForm 
              productId={product.id}
              variants={variants.filter(v => v.is_active).map(v => {
                // Parse option_values JSON (format: [{"name":"Color","value":"Black"},{"name":"Size","value":"42"}])
                let selectedOptions: { name: string; value: string }[] = [];
                try {
                  if (v.option_values) {
                    selectedOptions = typeof v.option_values === 'string' 
                      ? JSON.parse(v.option_values) 
                      : v.option_values;
                  }
                } catch (e) {
                  // If parsing fails, try to extract from variant name (e.g., "Black / 42")
                  if (v.name && v.name.includes('/')) {
                    const parts = v.name.split('/').map(p => p.trim());
                    selectedOptions = [
                      { name: 'Size', value: parts[0] || parts[1] || v.name }
                    ];
                  }
                }
                
                return {
                  id: v.id,
                  title: v.name || 'Default',
                  availableForSale: (v.stock_qty || 0) > 0,
                  selectedOptions,
                  price: { amount: String(v.price_cents), currencyCode: 'LKR' },
                  compareAtPrice: v.compare_at_price_cents ? { amount: String(v.compare_at_price_cents), currencyCode: 'LKR' } : null,
                };
              })}
              availableForSale={product.is_active === true && (product.stock_qty || 0) > 0} 
            />

            <div className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="font-display font-bold uppercase tracking-wider mb-4">Description</h2>
              <div className="prose prose-sm text-gray-600 font-body leading-relaxed max-w-none">
                {product.description || 'No description available.'}
              </div>
            </div>

            {product.how_to_use && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="font-display font-bold uppercase tracking-wider mb-4">How to Use</h2>
                <div className="prose prose-sm text-gray-600 font-body leading-relaxed max-w-none">
                  {product.how_to_use}
                </div>
              </div>
            )}

            {product.ingredients && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="font-display font-bold uppercase tracking-wider mb-4">Ingredients</h2>
                <div className="prose prose-sm text-gray-600 font-body leading-relaxed max-w-none">
                  {product.ingredients}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}