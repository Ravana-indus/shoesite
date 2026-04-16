import { getProduct } from '@/lib/shopify';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { AddToCartForm } from '@/components/product/AddToCartForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';

// Explicit fallback product for demonstration when API keys are missing
const MOCK_PRODUCT = {
  id: 'gid://shopify/Product/123456789',
  handle: 'ultraboost-22',
  availableForSale: true,
  title: 'Ultraboost 22 Running Shoes',
  description: 'These running shoes serve up comfort and responsiveness. You\'ll be riding on a BOOST midsole for endless energy, with a Linear Energy Push system and a Continental™ Rubber outsole. This shoe\'s upper is made with a high-performance yarn which contains at least 50% Parley Ocean Plastic.',
  descriptionHtml: '<p>These running shoes serve up comfort and responsiveness. You\'ll be riding on a BOOST midsole for endless energy, with a Linear Energy Push system and a Continental™ Rubber outsole. This shoe\'s upper is made with a high-performance yarn which contains at least 50% Parley Ocean Plastic.</p>',
  options: [{ id: 'opt_1', name: 'Size', values: ['7', '8', '9', '10', '11'] }],
  priceRange: {
    maxVariantPrice: { amount: '42500', currencyCode: 'LKR' },
    minVariantPrice: { amount: '42500', currencyCode: 'LKR' }
  },
  compareAtPriceRange: {
    maxVariantPrice: { amount: '48000', currencyCode: 'LKR' },
    minVariantPrice: { amount: '48000', currencyCode: 'LKR' }
  },
  variants: {
    edges: [
      { node: { id: 'gid://shopify/ProductVariant/v1', title: '7', availableForSale: true, selectedOptions: [{ name: 'Size', value: '7' }], price: { amount: '42500', currencyCode: 'LKR' }, compareAtPrice: null } },
      { node: { id: 'gid://shopify/ProductVariant/v2', title: '8', availableForSale: true, selectedOptions: [{ name: 'Size', value: '8' }], price: { amount: '42500', currencyCode: 'LKR' }, compareAtPrice: null } },
      { node: { id: 'gid://shopify/ProductVariant/v3', title: '9', availableForSale: false, selectedOptions: [{ name: 'Size', value: '9' }], price: { amount: '42500', currencyCode: 'LKR' }, compareAtPrice: null } },
      { node: { id: 'gid://shopify/ProductVariant/v4', title: '10', availableForSale: true, selectedOptions: [{ name: 'Size', value: '10' }], price: { amount: '42500', currencyCode: 'LKR' }, compareAtPrice: null } },
    ]
  },
  featuredImage: { url: '/products/ultraboost.jpg', altText: 'Ultraboost', width: 800, height: 800 },
  images: { edges: [{ node: { url: '/products/ultraboost.jpg', altText: 'Ultraboost', width: 800, height: 800 } }] },
  seo: { title: 'Ultraboost 22', description: 'Running shoes' },
  tags: ['Running', 'New']
};

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const { handle } = await props.params;

  let product;
  try {
    product = await getProduct(handle);
  } catch (e) {
    console.error('Error fetching product. Using mock fallback.', e);
  }

  // Fallback if the user hasn't supplied real Shopify credentials yet
  if (!product) {
    product = MOCK_PRODUCT;
  }

  if (!product) return notFound();

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAt = product.compareAtPriceRange?.maxVariantPrice?.amount;
  const originalPrice = compareAt ? parseFloat(compareAt) : null;
  const hasDiscount = originalPrice && originalPrice > price;

  const variants = product.variants.edges.map(e => e.node);
  const images = product.images.edges.map(e => e.node);

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
                  <div key={index} className="relative aspect-square bg-(--color-background) rounded-sm overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.altText || product.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))
              ) : (
                // Fallback image layout when no images exist
                <div className="relative aspect-square bg-gray-100 rounded-sm col-span-2 overflow-hidden flex justify-center items-center">
                   <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-col border-b border-gray-100 pb-8">
              <div className="flex gap-2 mb-4">
                {product.tags.includes('New') && <Badge variant="new">NEW</Badge>}
                {product.tags.includes('Bestseller') && <Badge variant="bestseller">BESTSELLER</Badge>}
                {product.tags.includes('Running') && <Badge className="bg-gray-100 text-gray-800 border border-gray-200">RUNNING</Badge>}
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tighter leading-none mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4">
                <span className="font-body text-2xl font-bold">{formatPrice(price)}</span>
                {hasDiscount && (
                  <>
                    <span className="font-body text-lg text-gray-400 line-through decoration-1">{formatPrice(originalPrice)}</span>
                    <span className="font-display font-semibold text-(--color-accent) uppercase tracking-widest text-sm">
                       Sale
                    </span>
                  </>
                )}
              </div>
            </div>

            <AddToCartForm variants={variants} availableForSale={product.availableForSale} />

            <div className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="font-display font-bold uppercase tracking-wider mb-4">Description</h2>
              {/* Note: In production we would dangerouslySetInnerHTML but here we keep it safe or just use the plain text */}
              <div className="prose prose-sm text-gray-600 font-body leading-relaxed max-w-none" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
