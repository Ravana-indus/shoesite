# adidaslk.lk Phase 1 - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-converting e-commerce frontend for Adidas products in Sri Lanka

**Architecture:** Next.js 14 App Router with Tailwind CSS, Hero-Centric + Feature-Rich pattern, Vibrant & Block-based style with Adidas brand colors

**Tech Stack:** Next.js 14, Tailwind CSS, React Context, Lucide Icons

---

## File Structure

```
adidaslk.lk/
├── app/
│   ├── layout.tsx              # Root layout with fonts, providers
│   ├── page.tsx               # Homepage
│   ├── globals.css            # Tailwind base + custom styles
│   └── cart/
│       └── page.tsx           # Cart page (Phase 2)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         # Floating navbar
│   │   └── Footer.tsx         # 4-column footer
│   ├── home/
│   │   ├── Hero.tsx           # Full-viewport hero
│   │   ├── Categories.tsx     # Bento grid categories
│   │   ├── NewArrivals.tsx    # Horizontal carousel
│   │   ├── BestSellers.tsx    # Product grid
│   │   └── SocialProof.tsx    # Reviews carousel
│   ├── product/
│   │   └── ProductCard.tsx    # Product card component
│   └── ui/
│       ├── Button.tsx         # Primary/secondary buttons
│       ├── Badge.tsx          # Sale/New badges
│       └── Skeleton.tsx       # Loading skeletons
├── lib/
│   ├── utils.ts               # Utility functions
│   └── cn.ts                  # Classname utility
├── public/
│   ├── fonts/                 # Barlow Condensed, DM Sans
│   └── images/
└── tailwind.config.ts         # Theme configuration
```

---

## Chunk 1: Project Setup & Core Infrastructure

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`

- [ ] **Step 1: Create Next.js project with Tailwind**

```bash
npx create-next-app@latest adidaslk --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git
cd adidaslk
```

- [ ] **Step 1.5: Create placeholder directories**

```bash
mkdir -p public/images/products
mkdir -p public/images/categories
```

- [ ] **Step 2: Configure Tailwind with Adidas theme**

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#D6241F',
        neutral: '#1A1A1A',
        trust: '#10B981',
        background: '#FAFAF9',
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 3: Install dependencies**

```bash
npm install lucide-react clsx tailwind-merge
npm install -D @types/node
```

- [ ] **Step 4: Verify setup**

```bash
npm run dev
# Expected: Server starts on localhost:3000
```

- [ ] **Step 5: Commit**

```bash
git init && git add . && git commit -m "feat: initialize Next.js project with Adidas theme"
```

---

### Task 2: Create Utility Functions

**Files:**
- Create: `lib/cn.ts`
- Create: `lib/utils.ts`

- [ ] **Step 1: Create classname utility**

Create `lib/cn.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create format currency utility**

Create `lib/utils.ts`:

```typescript
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatPriceShort(price: number): string {
  if (price >= 100000) {
    return `Rs. ${(price / 100000).toFixed(1)}L`
  }
  if (price >= 1000) {
    return `Rs. ${(price / 1000).toFixed(0)}K`
  }
  return `Rs. ${price}`
}
```

- [ ] **Step 3: Verify utilities compile**

```bash
npx tsc --noEmit
# Expected: No errors
```

- [ ] **Step 4: Commit**

```bash
git add lib/ && git commit -m "feat: add utility functions (cn, formatPrice)"
```

---

### Task 3: Set Up Fonts & Global Styles

**Files:**
- Create: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create global styles**

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-barlow: 'Barlow Condensed', sans-serif;
    --font-dm-sans: 'DM Sans', sans-serif;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-dm-sans);
    color: #1A1A1A;
    background-color: #FAFAF9;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-barlow);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Update root layout with fonts**

Update `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'adidaslk.lk | Authentic Adidas in Sri Lanka',
  description: 'Shop authentic Adidas shoes, apparel, and accessories in Sri Lanka. Premium sportswear, fast delivery, secure payment.',
  keywords: 'Adidas, Sri Lanka, shoes, sportswear, running, training, football',
  openGraph: {
    title: 'adidaslk.lk | Authentic Adidas in Sri Lanka',
    description: 'Shop authentic Adidas shoes, apparel, and accessories in Sri Lanka.',
    type: 'website',
    locale: 'en_LK',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${barlow.variable} ${dmSans.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify fonts load**

```bash
npm run dev
# Open http://localhost:3000, check fonts in DevTools
# Expected: Barlow Condensed for h1, DM Sans for body
```

- [ ] **Step 4: Commit**

```bash
git add app/ && git commit -m "feat: set up fonts and global styles"
```

---

## Chunk 2: Core UI Components

### Task 4: Create Button Component

**Files:**
- Create: `components/ui/Button.tsx`

- [ ] **Step 1: Create Button component**

Create `components/ui/Button.tsx`:

```tsx
import { cn } from '@/lib/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-display font-semibold uppercase tracking-wide transition-all duration-200',
          'cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary text-white hover:bg-accent': variant === 'primary',
            'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white':
              variant === 'secondary',
            'bg-transparent hover:bg-black/5': variant === 'ghost',
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

- [ ] **Step 2: Verify Button renders**

```bash
npm run dev
# Expected: No compilation errors
```

- [ ] **Step 3: Commit**

```bash
git add components/ && git commit -m "feat: add Button component"
```

---

### Task 5: Create Badge Component

**Files:**
- Create: `components/ui/Badge.tsx`

- [ ] **Step 1: Create Badge component**

Create `components/ui/Badge.tsx`:

```tsx
import { cn } from '@/lib/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'new' | 'sale' | 'bestseller' | 'lowstock'
  className?: string
}

export function Badge({ children, variant = 'new', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-display font-bold uppercase tracking-wide',
        {
          'bg-primary text-white': variant === 'new',
          'bg-accent text-white': variant === 'sale',
          'bg-trust text-white': variant === 'bestseller',
          'bg-orange-500 text-white animate-pulse': variant === 'lowstock',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Badge.tsx && git commit -m "feat: add Badge component"
```

---

### Task 6: Create Skeleton Loader

**Files:**
- Create: `components/ui/Skeleton.tsx`

- [ ] **Step 1: Create Skeleton component**

Create `components/ui/Skeleton.tsx`:

```tsx
import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        {
          'rounded': variant === 'rectangular',
          'rounded-full': variant === 'circular',
          'rounded h-4': variant === 'text',
        },
        className
      )}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Skeleton.tsx && git commit -m "feat: add Skeleton component"
```

---

## Chunk 3: Layout Components

### Task 7: Create Navbar Component

**Files:**
- Create: `components/layout/Navbar.tsx`

- [ ] **Step 1: Create Navbar component**

Create `components/layout/Navbar.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { href: '/men', label: "Men's" },
  { href: '/women', label: "Women's" },
  { href: '/kids', label: "Kids'" },
  { href: '/new', label: 'New Arrivals' },
  { href: '/sale', label: 'Sale' },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount] = useState(0)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tighter">
              ADIDAS<span className="text-accent">LK</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-display text-sm font-semibold uppercase tracking-wide hover:text-accent transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <User className="w-5 h-5" />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 font-display font-semibold uppercase hover:bg-gray-50 rounded transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Navbar.tsx && git commit -m "feat: add Navbar with mobile menu"
```

---

### Task 8: Create Footer Component

**Files:**
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Create Footer component**

Create `components/layout/Footer.tsx`:

```tsx
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

const footerLinks = {
  shop: [
    { href: '/men', label: "Men's" },
    { href: '/women', label: "Women's" },
    { href: '/kids', label: "Kids'" },
    { href: '/new', label: 'New Arrivals' },
    { href: '/sale', label: 'Sale' },
  ],
  help: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns & Exchanges' },
    { href: '/faq', label: 'FAQ' },
  ],
  about: [
    { href: '/about', label: 'About Us' },
    { href: '/authenticity', label: 'Authenticity Guarantee' },
    { href: '/careers', label: 'Careers' },
  ],
}

const paymentMethods = [
  { name: 'Visa', icon: 'visa' },
  { name: 'Mastercard', icon: 'mastercard' },
  { name: 'Amex', icon: 'amex' },
  { name: 'eZCash', icon: 'ezcash' },
  { name: 'Genie', icon: 'genie' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Shop */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4">Help</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-display text-lg font-bold uppercase mb-4">Connect</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              Email: support@adidaslk.lk<br />
              Phone: +94 11 XXX XXXX
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">We accept:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="w-10 h-6 bg-white/10 rounded flex items-center justify-center"
                    title={method.name}
                  >
                    <span className="text-xs text-white font-bold">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} adidaslk.lk. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Footer.tsx && git commit -m "feat: add Footer with payment methods"
```

---

## Chunk 4: Homepage Components

### Task 9: Create Hero Component

**Files:**
- Create: `components/home/Hero.tsx`

- [ ] **Step 1: Create Hero component**

Create `components/home/Hero.tsx`:

```tsx
'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-primary to-gray-800" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="max-w-2xl">
          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tighter leading-none animate-fade-in-up">
            IMPOSSIBLE IS
            <br />
            <span className="text-accent">NOTHING</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-200 font-body animate-fade-in-up [animation-delay:100ms]">
            Authentic Adidas shoes, apparel, and accessories.
            <br />
            Delivered across Sri Lanka.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:200ms]">
            <Button size="lg" className="group">
              SHOP NOW
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              NEW ARRIVALS
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap gap-6 animate-fade-in-up [animation-delay:300ms]">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 bg-trust rounded-full" />
              <span className="text-sm font-medium">100% Authentic</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 bg-trust rounded-full" />
              <span className="text-sm font-medium">Island-wide Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-2 h-2 bg-trust rounded-full" />
              <span className="text-sm font-medium">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/Hero.tsx && git commit -m "feat: add Hero section with animations"
```

---

### Task 10: Create Categories Component (Bento Grid)

**Files:**
- Create: `components/home/Categories.tsx`

- [ ] **Step 1: Create Categories component**

Create `components/home/Categories.tsx`:

```tsx
'use client'

import { cn } from '@/lib/cn'

const categories = [
  {
    id: 'men',
    title: "Men's",
    subtitle: 'Running, Training & Lifestyle',
    image: '/images/category-men.jpg',
    href: '/men',
    size: 'large',
  },
  {
    id: 'women',
    title: "Women's",
    subtitle: 'Sportswear & Sneakers',
    image: '/images/category-women.jpg',
    href: '/women',
    size: 'medium',
  },
  {
    id: 'kids',
    title: "Kids'",
    subtitle: 'For Young Athletes',
    image: '/images/category-kids.jpg',
    href: '/kids',
    size: 'medium',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    subtitle: 'Bags, Hats & More',
    image: '/images/category-accessories.jpg',
    href: '/accessories',
    size: 'small',
  },
]

export function Categories() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">
            Shop by Category
          </h2>
          <p className="mt-4 text-gray-600">Find your perfect fit</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {categories.map((category, index) => (
            <a
              key={category.id}
              href={category.href}
              className={cn(
                'relative overflow-hidden rounded-lg group cursor-pointer',
                'bg-gradient-to-br from-gray-200 to-gray-300',
                'hover:shadow-xl transition-all duration-300',
                {
                  'md:col-span-2 md:row-span-2': category.id === 'men',
                  'md:col-span-1 md:row-span-1': category.id !== 'men',
                }
              )}
            >
              {/* Background Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-gray-800" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-display text-2xl font-bold text-white uppercase group-hover:text-accent transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-300 text-sm mt-1">{category.subtitle}</p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/Categories.tsx && git commit -m "feat: add Categories Bento Grid"
```

---

### Task 11: Create Product Card Component

**Files:**
- Create: `components/product/ProductCard.tsx`

- [ ] **Step 1: Create ProductCard component**

Create `components/product/ProductCard.tsx`:

```tsx
'use client'

import { Heart, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/utils'

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  isNew?: boolean
  isBestseller?: boolean
  stockRemaining?: number
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discount = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  return (
    <article
      className={cn(
        'group relative bg-white rounded-lg overflow-hidden',
        'hover:shadow-lg transition-all duration-300',
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {/* Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <Badge variant="new">NEW</Badge>}
          {product.isBestseller && <Badge variant="bestseller">BESTSELLER</Badge>}
          {hasDiscount && <Badge variant="sale">-{discount}%</Badge>}
          {product.stockRemaining && product.stockRemaining <= 5 && (
            <Badge variant="lowstock">ONLY {product.stockRemaining} LEFT</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-white text-primary font-display font-bold uppercase rounded hover:bg-accent hover:text-white transition-colors cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
        <h3 className="mt-1 font-display font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/product/ProductCard.tsx && git commit -m "feat: add ProductCard component"
```

---

### Task 12: Create New Arrivals Carousel

**Files:**
- Create: `components/home/NewArrivals.tsx`

- [ ] **Step 1: Create NewArrivals component**

Create `components/home/NewArrivals.tsx`:

```tsx
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard, Product } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'

const newProducts: Product[] = [
  {
    id: '1',
    name: 'Ultraboost 22',
    price: 42500,
    image: '/products/ultraboost.jpg',
    category: 'Running',
    isNew: true,
  },
  {
    id: '2',
    name: 'NMD_R1 V3',
    price: 35000,
    image: '/products/nmd.jpg',
    category: 'Lifestyle',
    isNew: true,
  },
  {
    id: '3',
    name: 'Stan Smith',
    price: 18000,
    image: '/products/stan-smith.jpg',
    category: 'Originals',
    isNew: true,
  },
  {
    id: '4',
    name: 'Forum Low',
    price: 22500,
    image: '/products/forum.jpg',
    category: 'Originals',
    isNew: true,
  },
  {
    id: '5',
    name: 'Samba OG',
    price: 24000,
    image: '/products/samba.jpg',
    category: 'Originals',
    isNew: true,
  },
]

export function NewArrivals() {
  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('new-arrivals-scroll')
    if (container) {
      const scrollAmount = 300
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">
              New Arrivals
            </h2>
            <p className="mt-2 text-gray-600">Fresh drops for the new season</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          id="new-arrivals-scroll"
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {newProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-72" style={{ scrollSnapAlign: 'start' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="secondary">VIEW ALL NEW ARRIVALS</Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/NewArrivals.tsx && git commit -m "feat: add NewArrivals carousel"
```

---

### Task 13: Create Best Sellers Grid

**Files:**
- Create: `components/home/BestSellers.tsx`

- [ ] **Step 1: Create BestSellers component**

Create `components/home/BestSellers.tsx`:

```tsx
'use client'

import { ProductCard, Product } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'

const bestSellers: Product[] = [
  {
    id: 'bs1',
    name: 'Superstar',
    price: 16500,
    image: '/products/superstar.jpg',
    category: 'Originals',
    isBestseller: true,
    stockRemaining: 3,
  },
  {
    id: 'bs2',
    name: 'Gazelle',
    price: 19500,
    image: '/products/gazelle.jpg',
    category: 'Originals',
    isBestseller: true,
  },
  {
    id: 'bs3',
    name: 'UltraBoost 21',
    price: 39900,
    originalPrice: 45000,
    image: '/products/ultraboost-21.jpg',
    category: 'Running',
    isBestseller: true,
    stockRemaining: 2,
  },
  {
    id: 'bs4',
    name: 'Adilette Slides',
    price: 8500,
    image: '/products/adilette.jpg',
    category: 'Slides',
    isBestseller: true,
  },
  {
    id: 'bs5',
    name: 'NMD_R1',
    price: 32000,
    image: '/products/nmd-r1.jpg',
    category: 'Lifestyle',
    isBestseller: true,
  },
  {
    id: 'bs6',
    name: 'Alphaboost V1',
    price: 38500,
    image: '/products/alphaboost.jpg',
    category: 'Running',
    isBestseller: true,
    stockRemaining: 4,
  },
  {
    id: 'bs7',
    name: 'Continental 80',
    price: 21000,
    image: '/products/continental.jpg',
    category: 'Originals',
    isBestseller: true,
  },
  {
    id: 'bs8',
    name: 'Rapid Runner',
    price: 12500,
    image: '/products/rapid-runner.jpg',
    category: 'Running',
    isBestseller: true,
  },
]

export function BestSellers() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">
            Best Sellers
          </h2>
          <p className="mt-4 text-gray-600">Most loved by our customers</p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button>VIEW ALL PRODUCTS</Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/BestSellers.tsx && git commit -m "feat: add BestSellers grid"
```

---

### Task 14: Create Social Proof Bar

**Files:**
- Create: `components/home/SocialProof.tsx`

- [ ] **Step 1: Create SocialProof component**

Create `components/home/SocialProof.tsx`:

```tsx
'use client'

import { Star, Quote } from 'lucide-react'
import { cn } from '@/lib/cn'

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
]

const stats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '4.9', label: 'Average Rating' },
  { value: '100%', label: 'Authentic Products' },
  { value: '48hrs', label: 'Delivery Time' },
]

export function SocialProof() {
  return (
    <section className="py-16 bg-primary text-white">
      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold text-accent">
                {stat.value}
              </p>
              <p className="mt-2 text-gray-300 text-sm uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-center font-display text-2xl font-bold uppercase mb-8">
          What Our Customers Say
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="bg-white/10 rounded-lg p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
                    )}
                  />
                ))}
              </div>
              <Quote className="w-6 h-6 text-accent mb-2" />
              <p className="text-gray-200 mb-4">{review.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-sm text-gray-400">{review.location}</p>
                </div>
                {review.verified && (
                  <span className="text-xs bg-trust/20 text-trust px-2 py-1 rounded">
                    Verified Purchase
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/SocialProof.tsx && git commit -m "feat: add SocialProof section"
```

---

## Chunk 5: Homepage Assembly

### Task 15: Create Homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Assemble homepage components**

Update `app/page.tsx`:

```tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { Categories } from '@/components/home/Categories'
import { NewArrivals } from '@/components/home/NewArrivals'
import { BestSellers } from '@/components/home/BestSellers'
import { SocialProof } from '@/components/home/SocialProof'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <NewArrivals />
        <BestSellers />
        <SocialProof />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Verify homepage renders**

```bash
npm run dev
# Open http://localhost:3000
# Expected: Full homepage with all sections
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx && git commit -m "feat: assemble homepage with all sections"
```

---

### Task 16: Add Custom Animations to Tailwind

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add animation extensions**

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#D6241F',
        neutral: '#1A1A1A',
        trust: '#10B981',
        background: '#FAFAF9',
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      transitionDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.ts && git commit -m "feat: add custom animations"
```

---

## Chunk 6: Mobile Responsiveness & Polish

### Task 17: Add Responsive Utilities

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add responsive utilities**

Add to `app/globals.css`:

```css
@layer components {
  /* Hide scrollbar but allow scrolling */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Line clamp utilities */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Touch-friendly tap highlight */
  .tap-highlight-transparent {
    -webkit-tap-highlight-color: transparent;
  }
}
```

- [ ] **Step 2: Test mobile responsiveness**

```bash
npm run dev
# Open Chrome DevTools > Toggle device toolbar
# Test at: 375px, 768px, 1024px, 1440px
# Expected: Layout adjusts properly at all sizes
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css && git commit -m "feat: add responsive utilities"
```

---

### Task 18: Final Build & Verification

**Files:**
- Run build verification

- [ ] **Step 1: Run production build**

```bash
npm run build
# Expected: Build succeeds without errors
```

- [ ] **Step 2: Run linting**

```bash
npm run lint
# Expected: No ESLint errors
```

- [ ] **Step 3: Test production build locally**

```bash
npm run start
# Open http://localhost:3000
# Expected: Site loads correctly
```

- [ ] **Step 4: Final commit**

```bash
git add . && git commit -m "feat: adidaslk.lk Phase 1 complete - high-converting homepage"
```

---

## Summary

This plan creates a complete Phase 1 frontend for adidaslk.lk with:

1. ✅ Project setup with Next.js 14 + Tailwind CSS
2. ✅ Adidas brand-aligned design system
3. ✅ Core UI components (Button, Badge, Skeleton)
4. ✅ Layout components (Navbar, Footer)
5. ✅ Homepage sections (Hero, Categories, Products, Social Proof)
6. ✅ Mobile-responsive design
7. ✅ Performance optimizations
8. ✅ Accessibility considerations

**Ready to execute?**