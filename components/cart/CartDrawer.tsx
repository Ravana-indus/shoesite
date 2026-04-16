'use client';

import { useCart } from './CartProvider';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItemQuantity, removeItem, isUpdating } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const lines = cart?.lines?.edges?.map((edge) => edge.node) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={cn(
        "absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
            Your Cart ({cart?.totalQuantity || 0})
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 -mr-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-display font-medium text-xl uppercase tracking-wide text-gray-500">Your cart is empty</p>
              <Button onClick={closeCart} variant="secondary" className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-6">
              {lines.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative w-24 h-24 bg-gray-50 rounded-sm overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image
                      src={item.merchandise.product.featuredImage.url}
                      alt={item.merchandise.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-display font-bold text-lg w-3/4 line-clamp-2">
                          {item.merchandise.product.title}
                        </h3>
                        <p className="font-body font-bold text-sm">
                          {formatPrice(parseFloat(item.cost.totalAmount.amount))}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 font-body capitalize mt-1">
                        {item.merchandise.selectedOptions.map(o => o.value).join(' / ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-sm">
                        <button 
                          disabled={isUpdating}
                          onClick={() => updateItemQuantity(item.id, item.merchandise.id, item.quantity - 1)}
                          className="p-2 text-gray-500 hover:text-black disabled:opacity-50 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 font-body text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button 
                          disabled={isUpdating}
                          onClick={() => updateItemQuantity(item.id, item.merchandise.id, item.quantity + 1)}
                          className="p-2 text-gray-500 hover:text-black disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <button 
                        disabled={isUpdating}
                        onClick={() => removeItem(item.id)}
                        className="text-xs uppercase font-body font-bold tracking-wider text-gray-400 hover:text-(--color-accent) underline underline-offset-4 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && cart && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6 font-display">
              <span className="uppercase font-bold tracking-wider text-gray-500">Subtotal</span>
              <span className="text-2xl font-bold">{formatPrice(parseFloat(cart.cost.subtotalAmount.amount))}</span>
            </div>
            <p className="text-xs text-gray-500 mb-6 font-body">Taxes and shipping calculated at checkout.</p>
            <a href={cart.checkoutUrl} className="w-full">
              <Button size="lg" className="w-full flex justify-between items-center" disabled={isUpdating}>
                <span>Checkout</span>
                <span>{cart.totalQuantity} items</span>
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
