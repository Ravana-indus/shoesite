'use client';

import { Truck, Zap, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPriceCents } from '@/lib/types/database';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  estimated_days: string;
}

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedMethod: string | null;
  onSelect: (methodId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const icons: Record<string, typeof Truck> = {
  'Standard Delivery': Truck,
  'Express Delivery': Zap,
  'Store Pickup': Store,
};

export function ShippingMethodSelector({
  methods,
  selectedMethod,
  onSelect,
  onBack,
  onContinue,
}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold uppercase mb-4">Select Delivery Option</h3>
      
      {methods.map((method) => {
        const Icon = icons[method.name] || Truck;
        const isSelected = selectedMethod === method.id;
        
        return (
          <label
            key={method.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              isSelected
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="shippingMethod"
              value={method.id}
              checked={isSelected}
              onChange={() => onSelect(method.id)}
              className="sr-only"
            />
            <div className="flex-shrink-0 mr-4">
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{method.name}</span>
                <span className="font-bold">
                  {method.price_cents === 0 ? 'Free' : formatPriceCents(method.price_cents)}
                </span>
              </div>
              <p className="text-sm text-gray-500">{method.description}</p>
              <p className="text-sm text-gray-500">Estimated: {method.estimated_days}</p>
            </div>
          </label>
        );
      })}
      
      <div className="flex gap-4 mt-6">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onContinue} 
          disabled={!selectedMethod}
          className="flex-1"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}