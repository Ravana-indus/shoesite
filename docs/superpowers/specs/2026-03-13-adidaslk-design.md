# adidaslk.lk - Design Specification

## Project Overview
- **Name**: adidaslk.lk
- **Type**: E-commerce website for Adidas products in Sri Lanka
- **Phase 1**: Frontend with high-converting design
- **Phase 2**: Admin and CMS (future)
- **Target Audience**: Young adults (18-35), premium segment
- **Fulfillment**: Hybrid (local inventory + dropship)

---

## Design System

### Pattern
**Hero-Centric + Feature-Rich Showcase**
- CTA above fold
- Immersive product discovery
- Horizontal scroll journey for product categories

### Style: Vibrant & Block-based
- Bold, energetic, athletic design
- High color contrast
- Geometric shapes
- Performance: ✅ Good | Accessibility: ◐ Ensure WCAG

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary | Pure Black | `#000000` |
| Secondary | Pure White | `#FFFFFF` |
| Accent | Adidas Red | `#D6241F` |
| Neutral | Off-Black | `#1A1A1A` |
| Trust | Success Green | `#10B981` |
| Background | Off-White | `#FAFAF9` |

### Typography
- **Headlines**: Barlow Condensed (athletic, bold, uppercase)
- **Body**: DM Sans (modern, readable, premium)
- **Min body text**: 16px on mobile (accessibility)

### Key UX Guidelines
- Touch targets: 44x44px minimum
- Hover transitions: 150-300ms
- prefers-reduced-motion: Respect accessibility
- Skeleton screens for loading states
- Color contrast: 4.5:1 minimum ratio
- No emojis as icons (use SVG Lucide/Heroicons)

---

## Page Specifications

### 1. Homepage Sections

#### Hero Section (Above Fold)
- Full-viewport height, edge-to-edge imagery
- Headline: "IMPOSSIBLE IS NOTHING" (72px desktop / 40px mobile)
- Subheadline: "Authentic Adidas in Sri Lanka"
- Primary CTA: "SHOP NOW" button (black → red on hover)
- Secondary: "View New Arrivals" link with arrow
- Animation: Staggered reveal (0.3s delay)

#### Featured Categories (Bento Grid)
- 2x2 grid desktop / 2-column mobile
- Categories: Men's, Women's, Kids', Accessories
- Hover: Scale 1.02x, shadow increase

#### New Arrivals Carousel
- Horizontal scroll, 4 products visible desktop / 2 mobile
- Per card: Image, name, price (LKR), "New" badge
- Auto-scroll pause on hover

#### Best Sellers / Trending
- 4-column grid desktop / 2-column mobile
- "🔥 Best Seller" badges
- Stock remaining indicators

#### Social Proof Bar
- Customer reviews carousel
- Star ratings
- Verified purchase badges

#### Footer
- 4-column desktop / accordion mobile
- Sections: Shop, Help, About, Contact
- Payment icons: Visa, Mastercard, Amex, eZCash, Genie

### 2. Product Page (Future Phase 1)
- Large product imagery with zoom
- Size selector
- Add to cart (sticky on mobile)
- Product description, specs
- Related products

### 3. Cart & Checkout (Future Phase 1)
- Slide-out cart drawer
- Quantity controls
- Promo code input
- Multiple payment options (COD, Card, eZCash)

---

## Technical Stack (Phase 1)
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Payments**: Stripe integration
- **State**: React Context + useState

---

## Acceptance Criteria
1. ✅ Homepage loads in < 3 seconds
2. ✅ Mobile responsive (375px, 768px, 1024px, 1440px)
3. ✅ All interactive elements have hover states
4. ✅ Color contrast meets WCAG 4.5:1
5. ✅ Navigation works without JavaScript (basic)
6. ✅ All images have alt text
7. ✅ No horizontal scroll on mobile
8. ✅ Touch targets minimum 44x44px

---

## Phase 2 (Future)
- Admin dashboard
- CMS for product management
- Order management system
- Customer accounts
- Review system