import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="font-display text-2xl font-bold uppercase mb-2">Your Cart is Empty</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Looks like you haven&apos;t added anything to your cart yet. 
        Explore our collection and find something you&apos;ll love.
      </p>
      <Link href="/">
        <Button>Start Shopping</Button>
      </Link>
    </div>
  );
}