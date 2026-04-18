import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { NewArrivals } from '@/components/home/NewArrivals';
import { BestSellers } from '@/components/home/BestSellers';
import { SocialProof } from '@/components/home/SocialProof';
import { getFeaturedProducts, getProducts, getCategories, type Product } from '@/lib/supabase';
import { formatPriceCents } from '@/lib/types/database';

interface StorefrontProduct {
  id: string;
  handle: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  stockRemaining?: number;
}

function mapProductToStorefront(p: any): StorefrontProduct {
  const images = p.product_images || [];
  const image = images[0]?.url || '/placeholder.jpg';
  const originalPrice = p.compare_at_price_cents || undefined;
  const price = p.price_cents;
  const handle = p.handle || p.slug || p.id;
  
  return {
    id: p.id,
    handle,
    name: p.name,
    price,
    originalPrice,
    image,
    category: p.categories?.name || 'Uncategorized',
    isNew: true,
    stockRemaining: p.stock_qty,
  };
}

export default async function Home() {
  let newArrivals: StorefrontProduct[] = [];
  let bestSellers: StorefrontProduct[] = [];

  try {
    // Fetch from Supabase
    const supabaseProducts = await getProducts({ limit: 10, isActive: true });
    const featuredProducts = await getFeaturedProducts(8);
    await getCategories(); // Ensure categories are cached
    
    newArrivals = supabaseProducts.map(mapProductToStorefront);
    bestSellers = featuredProducts.map(mapProductToStorefront);
  } catch (error) {
    console.log('Supabase fetch failed:', error);
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-[100svh] flex-col">
        <Hero />
        <Categories />
        <NewArrivals products={newArrivals as any} />
        <BestSellers products={bestSellers as any} />
        <SocialProof />
      </main>
      <Footer />
    </>
  );
}