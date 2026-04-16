import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { NewArrivals } from '@/components/home/NewArrivals';
import { BestSellers } from '@/components/home/BestSellers';
import { SocialProof } from '@/components/home/SocialProof';
import { getCollectionProducts } from '@/lib/shopify';
import { mapShopifyProduct } from '@/lib/shopify/adapter';
import { Product } from '@/components/product/ProductCard';

export default async function Home() {
  let newArrivals: Product[] = [];
  let bestSellers: Product[] = [];

  try {
    // Attempt to fetch from Shopify, with safe fallbacks if env vars are missing
    const shopifyNewArrivals = await getCollectionProducts('new-arrivals');
    const shopifyBestSellers = await getCollectionProducts('best-sellers');
    
    // Map to UI interface
    newArrivals = shopifyNewArrivals.map(mapShopifyProduct).slice(0, 10);
    bestSellers = shopifyBestSellers.map(mapShopifyProduct).slice(0, 8);
  } catch (error) {
    console.log('Shopify fetch failed or keys missing, falling back to mock data.', error);
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-[100svh] flex-col">
        <Hero />
        <Categories />
        <NewArrivals products={newArrivals} />
        <BestSellers products={bestSellers} />
        <SocialProof />
      </main>
      <Footer />
    </>
  );
}
