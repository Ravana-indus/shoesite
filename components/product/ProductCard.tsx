'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatPrice } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isBestseller?: boolean;
  stockRemaining?: number;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <article
      className={cn(
        'group relative bg-white overflow-hidden',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-(--color-background) overflow-hidden rounded-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
        
        {/* Mock Image Gradient (since we don't have real images yet) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
          {product.isNew && <Badge variant="new">NEW</Badge>}
          {product.isBestseller && <Badge variant="bestseller">BESTSELLER</Badge>}
          {hasDiscount && <Badge variant="sale">-{discount}%</Badge>}
          {product.stockRemaining && product.stockRemaining <= 5 && (
            <Badge variant="lowstock">ONLY {product.stockRemaining} LEFT</Badge>
          )}
        </div>

        {/* Quick Actions (Wishlist) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            className="p-2.5 bg-white rounded-full shadow hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 hover:text-(--color-accent)"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex justify-center z-10">
          <button
            className="flex w-full items-center justify-center gap-2 px-6 py-3 bg-(--color-primary) text-white font-display font-bold uppercase tracking-wide rounded-sm shadow-xl hover:bg-(--color-accent) transition-colors cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
        
        {/* Hover overlay gradient to make buttons pop */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        <p className="text-xs text-gray-500 font-body uppercase tracking-widest">{product.category}</p>
        <h3 className="mt-1 font-display text-xl font-bold text-(--color-primary) group-hover:text-(--color-accent) transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 flex items-baseline gap-2 font-body">
          <span className="font-bold text-lg text-(--color-neutral)">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
