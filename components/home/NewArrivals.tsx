'use client';

import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard, Product } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { useRef } from 'react';
import { useCart } from '@/components/cart/CartProvider';

export const mockNewProducts: Product[] = [
  {
    id: '1',
    handle: 'ultraboost-22',
    name: 'Ultraboost 22',
    price: 42500,
    image: '/products/ultraboost.jpg',
    category: 'Running',
    isNew: true,
  },
  {
    id: '2',
    handle: 'nmd-r1-v3',
    name: 'NMD_R1 V3',
    price: 35000,
    image: '/products/nmd.jpg',
    category: 'Lifestyle',
    isNew: true,
  },
  {
    id: '3',
    handle: 'stan-smith',
    name: 'Stan Smith',
    price: 18000,
    image: '/products/stan-smith.jpg',
    category: 'Originals',
    isNew: true,
  },
  {
    id: '4',
    handle: 'forum-low',
    name: 'Forum Low',
    price: 22500,
    image: '/products/forum.jpg',
    category: 'Originals',
    isNew: true,
  },
  {
    id: '5',
    handle: 'samba-og',
    name: 'Samba OG',
    price: 24000,
    image: '/products/samba.jpg',
    category: 'Originals',
    isNew: true,
  },
];

export function NewArrivals({ products = [] }: { products?: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  
  const displayProducts = products.length > 0 ? products : mockNewProducts;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product.id, undefined, 1, product.price);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-(--color-primary)">
              New Arrivals
            </h2>
            <p className="mt-4 text-gray-600 font-body text-lg">Fresh drops. Be the first to wear them.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-3 border-2 border-gray-200 rounded-full hover:border-(--color-primary) hover:bg-(--color-primary) hover:text-white transition-all cursor-pointer group"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-3 border-2 border-gray-200 rounded-full hover:border-(--color-primary) hover:bg-(--color-primary) hover:text-white transition-all cursor-pointer group"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="hidden lg:block h-12 w-px bg-gray-200 mx-2" />
            <a href="/collections/new-arrivals" className="hidden lg:flex items-center text-sm font-display font-bold uppercase tracking-widest hover:text-(--color-accent) transition-colors group">
              View All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-12 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory"
          >
            {displayProducts.map((product) => (
              <div key={product.id} className="flex-none w-[280px] sm:w-[320px] snap-start">
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
            
            {/* View All Card */}
            <div className="flex-none w-[280px] sm:w-[320px] snap-start flex items-center justify-center bg-(--color-background) rounded-sm border border-gray-200 group cursor-pointer hover:bg-gray-100 transition-colors p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-(--color-primary) group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-(--color-primary)">Shop All New</h3>
                <p className="text-sm text-gray-500 font-body mt-2">Discover 50+ new styles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View All Button */}
        <div className="mt-4 text-center lg:hidden">
          <Button variant="secondary" className="w-full sm:w-auto">VIEW ALL NEW ARRIVALS</Button>
        </div>
      </div>
    </section>
  );
}
