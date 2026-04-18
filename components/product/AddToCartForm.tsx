'use client';

import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, X, Check, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantOption {
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: VariantOption[];
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  image?: { url: string; altText: string | null };
}

interface AddToCartFormProps {
  variants: ProductVariant[];
  availableForSale: boolean;
}

// Adidas shoe size guide (EU sizes with cm conversion)
const SIZE_GUIDE = {
  title: 'Adidas Size Guide',
  note: 'Measure your foot length in cm and find your size',
  headers: ['EU', 'UK', 'US', 'Foot Length (cm)'],
  sizes: [
    { eu: '36', uk: '3.5', us: '4', cm: '22.1' },
    { eu: '37', uk: '4', us: '4.5', cm: '22.5' },
    { eu: '38', uk: '4.5', us: '5', cm: '23' },
    { eu: '39', uk: '5.5', us: '6', cm: '23.6' },
    { eu: '40', uk: '6.5', us: '7', cm: '24.2' },
    { eu: '41', uk: '7', us: '7.5', cm: '24.7' },
    { eu: '42', uk: '7.5', us: '8', cm: '25.2' },
    { eu: '43', uk: '8.5', us: '9', cm: '25.8' },
    { eu: '44', uk: '9.5', us: '10', cm: '26.4' },
    { eu: '45', uk: '10.5', us: '11', cm: '27.1' },
    { eu: '46', uk: '11', us: '11.5', cm: '27.6' },
    { eu: '47', uk: '11.5', us: '12', cm: '28.1' },
    { eu: '48', uk: '12.5', us: '13', cm: '28.7' },
  ],
};

// Color mapping for swatches
const COLOR_MAP: Record<string, string> = {
  'black': '#000000',
  'white': '#FFFFFF',
  'core black': '#000000',
  'core white': '#FFFFFF',
  'cloud white': '#F5F5F5',
  'solar red': '#FF0000',
  'solar green': '#00FF00',
  'navy': '#000080',
  'grey': '#808080',
  'gray': '#808080',
  'burgundy': '#800020',
  'brown': '#8B4513',
  'tan': '#D2B48C',
  'beige': '#F5F5DC',
  'blue': '#0000FF',
  'red': '#FF0000',
  'pink': '#FFC0CB',
  'purple': '#800080',
  'orange': '#FFA500',
  'yellow': '#FFFF00',
  'gold': '#FFD700',
  'silver': '#C0C0C0',
};

function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] || '#808080';
}

export function AddToCartForm({ variants, availableForSale }: AddToCartFormProps) {
  const { addItem, isUpdating } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse options from variant titles (format: "Color / Size" or just "Size")
  const allOptions = new Map<string, Set<string>>();
  
  // If no options found from variants, show demo size options for shoes
  const demoMode = variants.length > 0 && variants.every(v => v.selectedOptions.length === 0);
  
  if (demoMode) {
    // Show demo sizes for shoe products
    const demoSizes = ['40', '41', '42', '43', '44', '45', '46'];
    allOptions.set('Size', new Set(demoSizes));
  } else {
    variants.forEach(v => {
      v.selectedOptions.forEach(opt => {
        if (!allOptions.has(opt.name)) {
          allOptions.set(opt.name, new Set());
        }
        allOptions.get(opt.name)!.add(opt.value);
      });
    });
  }

  const optionNames = Array.from(allOptions.keys());
  const hasColor = optionNames.some(name => /color|colour/i.test(name));
  const hasSize = optionNames.some(name => /size/i.test(name));

  // Find selected variant based on selections
  const findMatchingVariant = () => {
    if (demoMode) {
      // In demo mode, find first available variant or use first one
      return variants.find(v => v.availableForSale) || variants[0];
    }
    if (Object.keys(selectedOptions).length === 0) return undefined;
    return variants.find(v => 
      v.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value)
    );
  };

  const selectedVariant = findMatchingVariant();

  // Check availability for each option value
  const getOptionAvailability = (optionName: string, optionValue: string) => {
    if (demoMode) {
      // In demo mode, all sizes available
      return true;
    }
    const hasAvailable = variants.some(v => 
      v.availableForSale && 
      v.selectedOptions.some(opt => opt.name === optionName && opt.value === optionValue)
    );
    return hasAvailable;
  };

  const handleSelectOption = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }));
    setError(null);
  };

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (demoMode) {
      // In demo mode, just add the first variant
      const variant = variants.find(v => v.availableForSale) || variants[0];
      if (!variant) {
        setError('No variants available');
        return;
      }
      try {
        await addItem(variant.id, undefined, 1, Number(variant.price?.amount || 0));
        return;
      } catch (err) {
        console.error(err);
        setError('Failed to add to cart. Please try again.');
        return;
      }
    }
    
    // Check all options are selected
    const missingOptions = optionNames.filter(name => !selectedOptions[name]);
    if (missingOptions.length > 0) {
      setError(`Please select: ${missingOptions.join(', ')}`);
      return;
    }

    if (!selectedVariant) {
      setError('Please select all options');
      return;
    }

    if (!selectedVariant.availableForSale) {
      setError('This option is out of stock');
      return;
    }

    try {
      const productId = selectedVariant.id;
      const variantId = undefined;
      const quantity = 1;
      const priceCents = Number(selectedVariant.price?.amount || 0);
      await addItem(productId, variantId, quantity, priceCents);
    } catch (err) {
      console.error(err);
      setError('Failed to add to cart. Please try again.');
    }
  };

  // Group options by type for display
  const colorOptions = hasColor ? 
    Array.from(allOptions.get(optionNames.find(n => /color|colour/i.test(n)) || '') || []) : 
    [];
  const sizeOptions = hasSize ?
    Array.from(allOptions.get(optionNames.find(n => /size/i.test(n)) || '') || []) :
    [];

  // Sort sizes numerically
  const sortSizes = (a: string, b: string) => {
    const numA = parseFloat(a.replace(/[^0-9.]/g, ''));
    const numB = parseFloat(b.replace(/[^0-9.]/g, ''));
    return numA - numB;
  };

  if (colorOptions.length > 0) colorOptions.sort();
  if (sizeOptions.length > 0) sizeOptions.sort(sortSizes);

  if (!variants.length) {
    return (
      <Button disabled size="lg" className="w-full mt-8 cursor-not-allowed text-gray-400 bg-gray-100 border-gray-100 font-bold uppercase tracking-wider h-14">
        Unavailable
      </Button>
    );
  }

  // Check if we should show size/color selectors or demo mode
  const hasOptionSelectors = optionNames.some(n => /color|colour|size/i.test(n));

  return (
    <>
      <form onSubmit={handleAddToCart} className="mt-8">
        {/* Color Selector (if applicable) */}
        {colorOptions.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display font-semibold uppercase tracking-wider text-sm">
                Color {selectedOptions[optionNames.find(n => /color|colour/i.test(n)) || ''] && (
                  <span className="font-normal text-gray-500 ml-2">
                    - {selectedOptions[optionNames.find(n => /color|colour/i.test(n)) || '']}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((colorValue) => {
                const optionName = optionNames.find(n => /color|colour/i.test(n)) || '';
                const isSelected = selectedOptions[optionName] === colorValue;
                const isAvailable = getOptionAvailability(optionName, colorValue);
                const colorHex = getColorHex(colorValue);
                const isLight = ['white', 'cloud white', 'beige', 'tan'].some(c => 
                  colorValue.toLowerCase().includes(c)
                );

                return (
                  <button
                    key={colorValue}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectOption(optionName, colorValue)}
                    className={cn(
                      "relative w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer",
                      isSelected 
                        ? "border-black ring-2 ring-black ring-offset-2" 
                        : "border-gray-200 hover:border-gray-400",
                      !isAvailable && "opacity-30 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: colorHex }}
                    title={`${colorValue}${!isAvailable ? ' - Out of stock' : ''}`}
                    aria-label={`Select color ${colorValue}`}
                  >
                    {isSelected && (
                      <span className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        isLight ? "text-black" : "text-white"
                      )}>
                        <Check className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selector */}
        {sizeOptions.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-display font-semibold uppercase tracking-wider text-sm">
                Size {selectedOptions[optionNames.find(n => /size/i.test(n)) || ''] && (
                  <span className="font-normal text-gray-500 ml-2">
                    - EU {selectedOptions[optionNames.find(n => /size/i.test(n)) || '']}
                  </span>
                )}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center gap-1 text-sm font-body text-gray-500 underline underline-offset-4 cursor-pointer hover:text-black transition-colors"
              >
                <Ruler className="w-4 h-4" />
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((sizeValue) => {
                const optionName = optionNames.find(n => /size/i.test(n)) || '';
                const isSelected = selectedOptions[optionName] === sizeValue;
                const isAvailable = getOptionAvailability(optionName, sizeValue);

                return (
                  <button
                    key={sizeValue}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectOption(optionName, sizeValue)}
                    className={cn(
                      "h-12 min-w-[3rem] px-4 border font-display font-bold transition-all duration-200 cursor-pointer",
                      isSelected 
                        ? "border-black bg-black text-white" 
                        : "border-gray-200 bg-white text-black hover:border-black",
                      !isAvailable && "opacity-30 cursor-not-allowed line-through relative overflow-hidden"
                    )}
                  >
                    {sizeValue}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Any other options */}
        {optionNames.filter(n => !/color|colour|size/i.test(n)).map(optionName => (
          <div key={optionName} className="mb-6">
            <h3 className="font-display font-semibold uppercase tracking-wider text-sm mb-3">
              {optionName}
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(allOptions.get(optionName) || []).map((value) => {
                const isSelected = selectedOptions[optionName] === value;
                const isAvailable = getOptionAvailability(optionName, value);

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleSelectOption(optionName, value)}
                    className={cn(
                      "h-12 min-w-[3rem] px-4 border font-display font-bold transition-all duration-200 cursor-pointer",
                      isSelected 
                        ? "border-black bg-black text-white" 
                        : "border-gray-200 bg-white text-black hover:border-black",
                      !isAvailable && "opacity-30 cursor-not-allowed line-through"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-red-600 text-sm font-medium mb-4 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!availableForSale || isUpdating || (!demoMode && !selectedVariant)}
          className="w-full flex items-center justify-center gap-3 h-14 group"
        >
          <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {isUpdating ? 'ADDING...' : availableForSale ? 'ADD TO BAG' : 'OUT OF STOCK'}
        </Button>

        {/* Trust guarantees */}
        <ul className="mt-6 space-y-3 font-body text-sm text-gray-500">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Free delivery on all orders over RS. 20,000
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Free returns and exchanges within 14 days
          </li>
        </ul>
      </form>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSizeGuide(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider">
                {SIZE_GUIDE.title}
              </h2>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">{SIZE_GUIDE.note}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {SIZE_GUIDE.headers.map(header => (
                        <th key={header} className="text-left py-2 px-3 font-semibold text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE.sizes.map(size => (
                      <tr key={size.eu} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{size.eu}</td>
                        <td className="py-2 px-3">{size.uk}</td>
                        <td className="py-2 px-3">{size.us}</td>
                        <td className="py-2 px-3 text-gray-500">{size.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                * Foot length is measured in cm. If between sizes, round up for comfort.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}