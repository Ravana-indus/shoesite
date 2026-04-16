import { getCollectionProducts } from '@/lib/shopify';
import { mapShopifyProduct } from '@/lib/shopify/adapter';
import { ProductCard, Product } from '@/components/product/ProductCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { mockNewProducts } from '@/components/home/NewArrivals';

export default async function CollectionPage(props: { params: Promise<{ handle: string }> }) {
  const { handle } = await props.params;

  let products: Product[] = [];
  try {
    const shopifyProducts = await getCollectionProducts(handle);
    products = shopifyProducts.map(mapShopifyProduct);
  } catch (error) {
    console.error(`Failed to fetch collection: ${handle}`, error);
  }

  // Graceful fallback if Shopify credentials aren't set up yet
  if (products.length === 0) {
    products = mockNewProducts;
  }

  // Formatting title from handle (e.g., 'new-arrivals' -> 'New Arrivals')
  const title = handle.replace(/-/g, ' ');

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-[100svh]">
        <div className="flex flex-col mb-12">
          <h1 className="font-display text-5xl sm:text-6xl font-bold uppercase tracking-tighter capitalize">
            {title}
          </h1>
          <p className="mt-4 font-body text-gray-500 max-w-2xl text-lg">
            Explore the latest from our {title.toLowerCase()} collection. Designed for performance, built for style.
          </p>
        </div>

        {/* Filters & Sorting Placeholder (UI only) */}
        <div className="flex justify-between items-center py-4 border-y border-gray-100 mb-8">
          <button className="font-display font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
            Filter & Sort
          </button>
          <span className="font-body text-sm text-gray-500">{products.length} Products</span>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <h2 className="font-display text-2xl font-bold uppercase mb-2">No Products Found</h2>
            <p className="text-gray-500 font-body">We couldn't find any items in this collection.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
