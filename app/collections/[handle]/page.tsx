import { getProducts, getCategoryBySlug, type Product } from '@/lib/supabase';
import { ProductCard, Product as ProductCardType } from '@/components/product/ProductCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function mapToProductCard(p: any): ProductCardType {
  const images = p.product_images || [];
  return {
    id: p.id,
    handle: p.handle || p.slug || p.id,
    name: p.name,
    price: p.price_cents,
    originalPrice: p.compare_at_price_cents,
    image: images[0]?.url || '/placeholder.jpg',
    category: p.categories?.name || 'Uncategorized',
    isNew: true,
    stockRemaining: p.stock_qty,
  };
}

export default async function CollectionPage(props: { params: Promise<{ handle: string }> }) {
  const { handle } = await props.params;

  let products: any[] = [];

  try {
    // Try to match the handle to a category slug
    const category = await getCategoryBySlug(handle);
    
    if (category) {
      // Filter by category
      products = await getProducts({ categoryId: category.id, isActive: true });
    } else {
      // Just get all active products
      products = await getProducts({ isActive: true, limit: 50 });
    }
  } catch (error) {
    console.error(`Failed to fetch collection: ${handle}`, error);
  }

  // Formatting title from handle
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
            Explore the latest from our collection.
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
            {products.map(product => (
              <ProductCard key={product.id} product={mapToProductCard(product)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="font-body text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}