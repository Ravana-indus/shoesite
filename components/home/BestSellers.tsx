'use client';

import { ProductCard, Product } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/components/cart/CartProvider';

export const mockBestSellers: Product[] = [
  {
    id: 'bs1',
    handle: 'superstar',
    name: 'Superstar',
    price: 16500,
    image: '/products/superstar.jpg',
    category: 'Originals',
    isBestseller: true,
    stockRemaining: 3,
  },
  {
    id: 'bs2',
    handle: 'gazelle',
    name: 'Gazelle',
    price: 19500,
    image: '/products/gazelle.jpg',
    category: 'Originals',
    isBestseller: true,
  },
  {
    id: 'bs3',
    handle: 'ultraboost-21',
    name: 'UltraBoost 21',
    price: 39900,
    originalPrice: 45000,
    image: '/products/ultraboost-21.jpg',
    category: 'Running',
    isBestseller: true,
    stockRemaining: 2,
  },
  {
    id: 'bs4',
    handle: 'adilette-slides',
    name: 'Adilette Slides',
    price: 8500,
    image: '/products/adilette.jpg',
    category: 'Slides',
    isBestseller: true,
  },
  {
    id: 'bs5',
    handle: 'nmd-r1',
    name: 'NMD_R1',
    price: 32000,
    image: '/products/nmd-r1.jpg',
    category: 'Lifestyle',
    isBestseller: true,
  },
  {
    id: 'bs6',
    handle: 'alphaboost-v1',
    name: 'Alphaboost V1',
    price: 38500,
    image: '/products/alphaboost.jpg',
    category: 'Running',
    isBestseller: true,
    stockRemaining: 4,
  },
  {
    id: 'bs7',
    handle: 'continental-80',
    name: 'Continental 80',
    price: 21000,
    image: '/products/continental.jpg',
    category: 'Originals',
    isBestseller: true,
  },
  {
    id: 'bs8',
    handle: 'rapid-runner',
    name: 'Rapid Runner',
    price: 12500,
    image: '/products/rapid-runner.jpg',
    category: 'Running',
    isBestseller: true,
  },
];

export function BestSellers({ products = [] }: { products?: Product[] }) {
  const { addItem } = useCart();
  
  const displayProducts = products.length > 0 ? products : mockBestSellers;

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product.id, undefined, 1, product.price);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <section className="py-24 bg-(--color-background)">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-(--color-primary)">
            Best Sellers
          </h2>
          <p className="mt-4 text-gray-600 font-body text-lg">Most loved by our customers</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="w-full sm:w-auto min-w-[300px]">VIEW ALL PRODUCTS</Button>
        </div>
      </div>
    </section>
  );
}
