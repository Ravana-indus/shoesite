import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function CancelPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="font-display text-3xl font-bold uppercase mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your payment was cancelled. Your order has not been completed.
          </p>
          
          <p className="text-gray-500 mb-8">
            No charges have been made to your account.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/checkout">
              <Button>Try Again</Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary">View Cart</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}