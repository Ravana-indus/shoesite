'use client';

import { useState } from 'react';
import { Menu, X, ShoppingBag, Search, User, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';

const navLinks = [
  { href: '/collections/men', label: "Men's" },
  { href: '/collections/women', label: "Women's" },
  { href: '/collections/kids', label: "Kids'" },
  { href: '/collections/new-arrivals', label: 'New Arrivals' },
  { href: '/search?q=sale', label: 'Sale' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, openCart } = useCart();
  const cartCount = (cart as any)?.totalQuantity || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tighter">
              ADIDAS<span className="text-(--color-accent)">LK</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-sm font-semibold uppercase tracking-wide hover:text-(--color-accent) transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/search" className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" aria-label="Search">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" aria-label="User Account">
              <User className="w-5 h-5" />
            </Link>
            <button 
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" 
              aria-label="Shopping Cart"
              onClick={openCart}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-(--color-accent) text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 font-display font-semibold uppercase hover:bg-gray-50 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
