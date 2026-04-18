'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { ShippingForm, ShippingData } from '@/components/checkout/ShippingForm';
import { ShippingMethodSelector } from '@/components/checkout/ShippingMethodSelector';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { getShippingMethods, getActiveCart, calculateOrderTotals, createOrder, getPayHereCheckoutUrl } from '@/lib/actions/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0,
    items: [] as any[],
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const methods = await getShippingMethods();
    setShippingMethods(methods);
    
    // Get cart for order summary
    // @ts-ignore - session ID from cookie
    const sessionId = document.cookie.match(/session_id=([^;]+)/)?.[1];
    if (sessionId) {
      const cart = await getActiveCart(sessionId);
      if (cart && cart.cart_items?.length > 0) {
        setOrderSummary(prev => ({
          ...prev,
          subtotal: cart.cart_items.reduce(
            (sum: number, item: any) => sum + (item.price_cents || 0) * (item.quantity || 0),
            0
          ),
          items: cart.cart_items.map((item: any) => ({
            name: item.product?.name || 'Unknown',
            quantity: item.quantity,
            price: item.price_cents,
          })),
        }));
      }
    }
  }

  const handleShippingSubmit = async (data: ShippingData) => {
    setShippingData(data);
    setStep(2);
  };

  const handleMethodSelect = async (methodId: string) => {
    setSelectedMethod(methodId);
    
    // Calculate totals with selected shipping method
    const sessionId = document.cookie.match(/session_id=([^;]+)/)?.[1];
    if (sessionId) {
      const cart = await getActiveCart(sessionId);
      if (cart) {
        const totals = await calculateOrderTotals(cart, methodId);
        if (totals) {
          setOrderSummary(prev => ({
            ...prev,
            shipping: totals.shipping,
            total: totals.total,
          }));
        }
      }
    }
  };

  const handlePayment = async () => {
    if (!shippingData || !selectedMethod) return;
    
    setIsProcessing(true);
    
    try {
      // Get cart ID
      const sessionId = document.cookie.match(/session_id=([^;]+)/)?.[1];
      if (!sessionId) {
        alert('Your cart has expired. Please add items again.');
        router.push('/cart');
        return;
      }
      
      // Create order
      const result = await createOrder(
        sessionId,
        shippingData,
        selectedMethod,
        0 // promo discount
      );
      
      if (result.error) {
        alert(result.error);
        setIsProcessing(false);
        return;
      }
      
      // Generate PayHere URL (or redirect to success for demo)
      const payHereResult = await getPayHereCheckoutUrl(
        result.orderId!,
        orderSummary.total,
        shippingData.email,
        result.orderNumber!
      );
      
      if (payHereResult.error) {
        alert(payHereResult.error);
        setIsProcessing(false);
        return;
      }
      
      // Redirect to PayHere or success page
      router.push(payHereResult.url || `/checkout/success?order_id=${result.orderId}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold uppercase text-center mb-8">
            Checkout
          </h1>
          
          <CheckoutSteps currentStep={step} />
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            {step === 1 && (
              <ShippingForm
                onSubmit={handleShippingSubmit}
                defaultValues={shippingData || undefined}
              />
            )}
            
            {step === 2 && (
              <ShippingMethodSelector
                methods={shippingMethods}
                selectedMethod={selectedMethod}
                onSelect={handleMethodSelect}
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
              />
            )}
            
            {step === 3 && (
              <PaymentForm
                orderSummary={orderSummary}
                onBack={() => setStep(2)}
                onPay={handlePayment}
                isProcessing={isProcessing}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}