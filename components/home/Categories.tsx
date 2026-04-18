'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'men',
    title: "Men's",
    subtitle: 'Running, Training & Lifestyle',
    href: '/collections/men',
    image: '/images/category-men.png'
  },
  {
    id: 'women',
    title: "Women's",
    subtitle: 'Sportswear & Sneakers',
    href: '/collections/women',
    image: '/images/category-women.png'
  },
  {
    id: 'kids',
    title: "Kids'",
    subtitle: 'For Young Athletes',
    href: '/collections/kids',
    image: '/images/category-kids.png'
  },
  {
    id: 'accessories',
    title: 'Accessories',
    subtitle: 'Bags, Hats & More',
    href: '/collections/accessories',
    image: '/images/category-accessories.png'
  },
];

export function Categories() {
  return (
    <section className="py-24 bg-(--color-background)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight text-(--color-primary)">
            Shop by Category
          </h2>
          <p className="mt-4 text-gray-600 font-body text-lg">Find your perfect fit</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[250px]">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={cn(
                'relative overflow-hidden rounded-lg group block',
                ...[
                  category.id === 'men' ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1'
                ]
              )}
            >
              <Image 
                src={category.image}
                alt={category.title}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-display text-3xl font-bold text-white uppercase tracking-wide group-hover:text-(--color-accent) transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-300 font-body mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {category.subtitle}
                  </p>
                </div>
                
                {/* Arrow icon */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <div className="bg-(--color-accent) p-3 rounded-full text-white">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Red Subtle Hover Overlay */}
              <div className="absolute inset-0 bg-(--color-accent)/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
