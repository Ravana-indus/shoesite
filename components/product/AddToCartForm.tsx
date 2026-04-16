'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/Button';
import { ProductVariant } from '@/lib/shopify/types';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartFormProps {
  variants: ProductVariant[];
  availableForSale: boolean;
}

export function AddToCartForm({ variants, availableForSale }: AddToCartFormProps) {
  const { addItem, isUpdating } = useCart();
  
  // By default, select the first available variant
  const defaultVariant = variants.find((v) => v.availableForSale) || variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant);
  const [error, setError] = useState<string | null>(null);

  // Group variants by the first option (e.g., Size)
  // Simplified for this demo: assumes the first option is the primary variant selector (e.g., "Size")
  const primaryOptionName = variants[0]?.selectedOptions[0]?.name || 'Option';
  const options = Array.from(new Set(variants.map(v => v.selectedOptions[0]?.value))).filter(Boolean);

  const handleSelectOption = (value: string) => {
    const variant = variants.find(v => v.selectedOptions[0]?.value === value);
    if (variant) setSelectedVariant(variant);
    setError(null);
  };

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) {
      setError('Please select an option');
      return;
    }
    if (!selectedVariant.availableForSale) {
      setError('This option is out of stock');
      return;
    }

    try {
      await addItem(selectedVariant.id, 1);
    } catch (err) {
      console.error(err);
      setError('Failed to add to cart. Please try again.');
    }
  };

  if (!variants.length) {
    return (
      <Button disabled size="lg" className="w-full mt-8 cursor-not-allowed text-gray-400 bg-gray-100 border-gray-100 font-bold uppercase tracking-wider h-14">
        Unavailable
      </Button>
    );
  }

  return (
    <form onSubmit={handleAddToCart} className="mt-8">
      
      {/* Variant Selector (e.g. Size) */}
      {options.length > 0 && options[0] !== 'Default Title' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-semibold uppercase tracking-wider text-sm">{primaryOptionName}</h3>
            <button type="button" className="text-sm font-body text-gray-500 underline underline-offset-4 cursor-pointer">Size Guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((optionValue) => {
              const variant = variants.find(v => v.selectedOptions[0]?.value === optionValue);
              const isSelected = selectedVariant?.id === variant?.id;
              const isAvailable = variant?.availableForSale;

              return (
                <button
                  key={optionValue}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleSelectOption(optionValue)}
                  className={cn(
                    "h-12 min-w-[3rem] px-4 border font-display font-bold transition-all duration-200 cursor-pointer",
                    isSelected 
                      ? "border-black bg-black text-white" 
                      : "border-gray-200 bg-white text-black hover:border-black",
                    !isAvailable && "opacity-30 cursor-not-allowed line-through hover:border-gray-200 relative overflow-hidden"
                  )}
                >
                  {optionValue}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-(--color-accent) text-sm font-medium mb-4">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={!availableForSale || isUpdating || !selectedVariant}
        className="w-full flex items-center justify-center gap-3 h-14 group"
      >
        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {isUpdating ? 'ADDING...' : availableForSale ? 'ADD TO BAG' : 'OUT OF STOCK'}
      </Button>

      {/* Trust guarantees below button */}
      <ul className="mt-6 space-y-3 font-body text-sm text-gray-500">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Free delivery on all orders over RS. 20,000
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Free returns and exchanges within 14 days
        </li>
      </ul>
    </form>
  );
}
