import { createServerClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchProducts(query: string) {
  if (!query) return [];
  
  const supabase = createServerClient();
  
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      brands(name),
      categories(name),
      product_images(url)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(24);
  
  return products || [];
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const products = await searchProducts(query);

  const mapProduct = (p: any) => ({
    id: p.id,
    handle: p.handle || p.slug || p.id,
    name: p.name,
    price: p.price_cents,
    originalPrice: p.compare_at_price_cents || undefined,
    image: p.product_images?.[0]?.url || '/placeholder.jpg',
    category: p.categories?.name || 'Uncategorized',
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold uppercase mb-6">
            Search Results
          </h1>
          
          <div className="max-w-2xl mb-8">
            <SearchBar />
          </div>
          
          {query && (
            <p className="text-gray-600 mb-6">
              {products.length} results for &quot;{query}&quot;
            </p>
          )}
          
          {products.length === 0 ? (
            <div className="text-center py-12">
              {query ? (
                <>
                  <p className="text-gray-500 mb-4">No products found for &quot;{query}&quot;</p>
                  <p className="text-sm text-gray-400">Try different keywords or browse categories</p>
                </>
              ) : (
                <p className="text-gray-500">Enter a search term to find products</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={mapProduct(p)} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}