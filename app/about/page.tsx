import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Truck, Shield, Headphones, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold uppercase text-center mb-12">
            About Us
          </h1>
          
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold uppercase mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              adidaslk.lk is Sri Lanka&apos;s premier destination for authentic Adidas products. 
              Founded in 2020, we set out with a simple mission: to bring genuine Adidas footwear 
              and apparel to Sri Lankan consumers without the hassle of international shipping 
              or concerns about counterfeit products.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we serve thousands of customers across the island, from Colombo to Jaffna, 
              delivering authentic sportswear that helps Sri Lankans perform at their best.
            </p>
          </section>
          
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold uppercase mb-4">
              Authenticity Guarantee
            </h2>
            <div className="bg-black text-white rounded-lg p-8">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">100% Genuine Adidas Products</h3>
                  <p className="text-gray-300">
                    We source directly from authorized Adidas distributors. Every product comes 
                    with original packaging and authenticity cards. If it&apos;s not authentic, 
                    we&apos;ll refund 100% of your purchase.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold uppercase mb-8 text-center">
              Why Choose Us?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Island-wide delivery within 2-3 business days
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Secure Payment</h3>
                <p className="text-gray-600 text-sm">
                  Pay securely with PayHere or cash on delivery
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold mb-2">Customer Support</h3>
                <p className="text-gray-600 text-sm">
                  Dedicated support team ready to help you
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}