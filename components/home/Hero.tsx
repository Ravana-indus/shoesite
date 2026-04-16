'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center bg-(--color-background) overflow-hidden mt-0 pt-16">
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.png"
          alt="Premium Adidas footwear"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32 w-full">
        <div className="max-w-2xl">
          {/* Headline */}
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold text-white uppercase tracking-tighter leading-none animate-[fadeInUp_0.6s_ease-out_forwards]">
            IMPOSSIBLE IS
            <br />
            <span className="text-(--color-accent)">NOTHING</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-200 font-body opacity-0 animate-[fadeInUp_0.6s_ease-out_100ms_forwards]">
            Authentic Adidas shoes, apparel, and accessories.
            <br />
            Delivered across Sri Lanka.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_200ms_forwards]">
            <Button size="lg" className="group">
              SHOP NOW
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-black"
            >
              NEW ARRIVALS
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap gap-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_300ms_forwards]">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 bg-(--color-trust) rounded-full" />
              <span className="text-sm font-medium tracking-wide uppercase">100% Authentic</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 bg-(--color-trust) rounded-full" />
              <span className="text-sm font-medium tracking-wide uppercase">Island-wide Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 bg-(--color-trust) rounded-full" />
              <span className="text-sm font-medium tracking-wide uppercase">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
