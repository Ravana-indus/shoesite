import Link from "next/link";
'use client';

import { useState } from 'react';
import { formatPriceCents } from '@/lib/types/database';
import { Button } from '@/components/ui/Button';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
  promoDiscount?: number;
}

export function CartSummary({ subtotal, itemCount, onCheckout, promoDiscount = 0 }: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  
  const shipping = subtotal > 10000 ? 0 : 350;
  const discount = discountApplied ? promoDiscount : 0;
  const total = subtotal + shipping - discount;

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    setPromoError('');
    
    // TODO: Validate promo code against API
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setDiscountApplied(true);
    } else {
      setPromoError('Invalid promo code');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
      <h2 className="font-display text-lg font-bold uppercase mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatPriceCents(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatPriceCents(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPriceCents(shipping)}</span>
        </div>
        {shipping > 0 && (
          <p className="text-sm text-green-600">
            Free shipping on orders over Rs. 10,000
          </p>
        )}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPriceCents(total)}</span>
          </div>
          <p className="text-sm text-gray-500">Including all taxes</p>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Button variant="secondary" onClick={applyPromo} className="text-sm">
            Apply
          </Button>
        </div>
        {promoError && (
          <p className="text-red-500 text-sm mt-1">{promoError}</p>
        )}
        {discountApplied && (
          <p className="text-green-600 text-sm mt-1">Promo code applied!</p>
        )}
      </div>
      
      {itemCount > 0 ? (
        <Button className="w-full" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      ) : (
        <Button className="w-full" disabled>
          Your Cart is Empty
        </Button>
      )}
      
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:text-black underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}