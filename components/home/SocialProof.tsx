'use client';

import { Star, Quote, ShieldCheck, Truck, ThumbsUp, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

const reviews = [
  {
    id: '1',
    name: 'Kamal P.',
    location: 'Colombo',
    rating: 5,
    text: 'Great quality and fast delivery! Got my Ultraboost within 2 days.',
    product: 'Ultraboost 22',
    verified: true,
  },
  {
    id: '2',
    name: 'Nisha F.',
    location: 'Kandy',
    rating: 5,
    text: '100% authentic products. Finally a trusted Adidas store in Sri Lanka!',
    product: 'Samba OG',
    verified: true,
  },
  {
    id: '3',
    name: 'Dinesh M.',
    location: 'Galle',
    rating: 4,
    text: 'Good selection and reasonable prices. Will definitely order again.',
    product: 'Stan Smith',
    verified: true,
  },
];

const stats = [
  { icon: ThumbsUp, value: '10,000+', label: 'Happy Customers' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
  { icon: Medal, value: '100%', label: 'Authentic Products' },
  { icon: Truck, value: '48hrs', label: 'Delivery Time' },
];

export function SocialProof() {
  return (
    <section className="py-24 bg-(--color-primary) text-white relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 opacity-10 pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '60s' }}>
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" />
          <polygon points="50,10 60,35 85,35 65,55 75,85 50,70 25,85 35,55 15,35 40,35" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 max-w-5xl mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 py-4 group-hover:bg-(--color-accent) group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-8 h-8 text-(--color-accent) group-hover:text-white transition-colors" />
                </div>
                <p className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tighter">
                  {stat.value}
                </p>
                <p className="mt-2 text-gray-400 text-sm uppercase tracking-widest font-display font-medium group-hover:text-gray-200 transition-colors">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reviews */}
        <div>
          <div className="text-center mb-16">
            <h3 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-tight">
              Community <span className="text-(--color-accent)">Voices</span>
            </h3>
            <p className="text-gray-400 mt-4 text-lg">Real reviews from our athletes and customers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="bg-white/5 border border-white/10 rounded-sm p-8 backdrop-blur-md hover:bg-white/10 transition-colors duration-300 group"
              >
                <div className="flex items-center gap-1.5 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-5 h-5',
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                      )}
                    />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-white/20 mb-4 group-hover:text-(--color-accent) transition-colors" />
                <p className="text-gray-200 text-lg leading-relaxed mb-8 font-body font-light">&quot;{review.text}&quot;</p>
                
                <div className="flex flex-col border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display text-xl font-bold uppercase tracking-wide">{review.name}</p>
                    {review.verified && (
                      <div className="flex items-center gap-1.5 bg-(--color-trust)/20 text-(--color-trust) px-2.5 py-1 rounded-full border border-(--color-trust)/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{review.location}</span>
                    <span>Purchased: <span className="text-white font-medium">{review.product}</span></span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
