'use client';

import { useState } from 'react';
import { formatPriceCents } from '@/lib/types/database';
import { Button } from '@/components/ui/Button';
import { Shield, CreditCard } from 'lucide-react';

interface PaymentFormProps {
  orderSummary: {
    subtotal: number;
    shipping: number;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  onBack: () => void;
  onPay: () => void;
  isProcessing: boolean;
}

export function PaymentForm({ orderSummary, onBack, onPay, isProcessing }: PaymentFormProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-display font-bold uppercase mb-4">Order Summary</h3>
        
        <div className="space-y-2 mb-4">
          {orderSummary.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="line-clamp-1">{item.name} × {item.quantity}</span>
              <span>{formatPriceCents(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPriceCents(orderSummary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{orderSummary.shipping === 0 ? 'Free' : formatPriceCents(orderSummary.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPriceCents(orderSummary.total)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-display font-bold uppercase mb-4">Payment Method</h3>
        
        <div className="border-2 border-black rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-6 h-6" />
            <span className="font-semibold">PayHere</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Secure payment via PayHere. Accepts Visa, Mastercard, and local payment methods.
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-white border rounded text-xs">Visa</span>
            <span className="px-2 py-1 bg-white border rounded text-xs">Mastercard</span>
            <span className="px-2 py-1 bg-white border rounded text-xs">eZCash</span>
          </div>
        </div>
      </div>
      
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-gray-600">
          I agree to the{' '}
          <a href="/terms" className="underline hover:text-black">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>
        </span>
      </label>
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Shield className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
      
      <div className="flex gap-4">
        <Button variant="secondary" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button 
          onClick={onPay} 
          disabled={!agreedToTerms || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatPriceCents(orderSummary.total)}`}
        </Button>
      </div>
    </div>
  );
}