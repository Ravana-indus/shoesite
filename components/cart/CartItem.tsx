'use client';

import Link from "next/link";
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { formatPriceCents } from '@/lib/types/database';

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    price_cents: number;
    product: {
      id: string;
      name: string;
      slug: string;
      product_images: { url: string }[];
      categories?: { name: string };
    };
    variant?: {
      name: string;
    };
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const image = item.product.product_images?.[0]?.url || '/placeholder.jpg';

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <Link href={`/product/${item.product.slug}`}
        className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
      >
        <Image
          src={image}
          alt={item.product.name}
          fill
          className="object-cover hover:scale-105 transition-transform"
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{item.product.categories?.name}</p>
            <Link href={`/product/${item.product.slug}`}
              className="font-medium text-gray-900 hover:text-accent transition-colors line-clamp-1"
            >
              {item.product.name}
            </Link>
            {item.variant && (
              <p className="text-sm text-gray-500">{item.variant.name}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center border border-gray-200 rounded">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 min-w-[3rem] text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <p className="font-semibold">{formatPriceCents(item.price_cents * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}