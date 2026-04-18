import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Heart } from 'lucide-react';

async function getWishlist() {
  const supabase = createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: wishlist } = await supabase
    .from('wishlist')
    .select(`
      *,
      product:products(*, product_images(url), categories(name))
    `)
    .eq('user_id', user.id);
  
  return wishlist || [];
}

export default async function WishlistPage() {
  const wishlist = await getWishlist();
  
  if (wishlist === null) {
    redirect('/admin/login?redirect=/wishlist');
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold uppercase mb-6">
            My Wishlist ({wishlist.length} items)
          </h1>
          
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="font-display text-xl font-bold uppercase mb-2">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-500 mb-8">
                Save items you love for later
              </p>
              <Link href="/" className="inline-block">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlist.map((item) => {
                const p = item.product as any;
                return (
                <ProductCard key={item.id} product={{
                  id: p.id,
                  handle: p.handle || p.slug || p.id,
                  name: p.name,
                  price: p.price_cents,
                  originalPrice: p.compare_at_price_cents || undefined,
                  image: p.product_images?.[0]?.url || '/placeholder.jpg',
                  category: p.categories?.name || 'Uncategorized',
                }} />
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}