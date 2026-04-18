import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('Starting database seed...');

  // Categories
  const categories = [
    { name: "Men's Shoes", slug: 'mens-shoes', description: "Athletic and casual footwear for men", display_order: 1, is_active: true },
    { name: "Women's Shoes", slug: 'womens-shoes', description: "Athletic and casual footwear for women", display_order: 2, is_active: true },
    { name: "Kids' Shoes", slug: 'kids-shoes', description: "Shoes for children ages 3-14", display_order: 3, is_active: true },
    { name: 'Accessories', slug: 'accessories', description: "Bags, socks, caps, and more", display_order: 4, is_active: true },
  ];

  for (const cat of categories) {
    await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
  }
  console.log('✓ Categories seeded');

  // Brands
  const brands = [
    { name: 'Adidas Originals', slug: 'adidas-originals', country_of_origin: 'Germany', is_active: true },
    { name: 'Adidas Performance', slug: 'adidas-performance', country_of_origin: 'Germany', is_active: true },
  ];

  for (const brand of brands) {
    await supabase.from('brands').upsert(brand, { onConflict: 'slug' });
  }
  console.log('✓ Brands seeded');

  // Get IDs for relationships
  const { data: categoriesData } = await supabase.from('categories').select('id, slug');
  const { data: brandsData } = await supabase.from('brands').select('id, slug');

  const catMap = Object.fromEntries((categoriesData || []).map((c: any) => [c.slug, c.id]));
  const brandMap = Object.fromEntries((brandsData || []).map((b: any) => [b.slug, b.id]));

  // Products
  const products = [
    {
      name: 'Ultraboost 22',
      slug: 'ultraboost-22',
      price_cents: 42500,
      compare_at_price_cents: 48000,
      category_id: catMap['mens-shoes'],
      brand_id: brandMap['adidas-performance'],
      description: 'Experience incredible energy return with Ultraboost 22. Designed for maximum comfort during long runs.',
      stock_qty: 15,
      key_benefits: ['Energy return', 'Primeknit upper'],
      is_active: true,
      is_featured: true,
    },
    {
      name: 'Stan Smith',
      slug: 'stan-smith',
      price_cents: 18000,
      category_id: catMap['mens-shoes'],
      brand_id: brandMap['adidas-originals'],
      description: 'The iconic tennis shoe that started it all. Clean, crisp, and timeless.',
      stock_qty: 30,
      key_benefits: ['Classic design', 'Premium leather'],
      is_active: true,
    },
    {
      name: 'Superstar',
      slug: 'superstar',
      price_cents: 16500,
      compare_at_price_cents: 18500,
      category_id: catMap['mens-shoes'],
      brand_id: brandMap['adidas-originals'],
      description: 'The legendary shell toe. Hip-hop icon and streetwear staple.',
      stock_qty: 8,
      key_benefits: ['Shell toe', 'Leather upper'],
      is_active: true,
      is_featured: true,
    },
    {
      name: 'Ultraboost 22 Womens',
      slug: 'ultraboost-22-womens',
      price_cents: 42500,
      category_id: catMap['womens-shoes'],
      brand_id: brandMap['adidas-performance'],
      description: "Women's specific fit with the same incredible energy return.",
      stock_qty: 12,
      key_benefits: ["Women's fit", 'Energy return'],
      is_active: true,
    },
    {
      name: 'Gazelle',
      slug: 'gazelle',
      price_cents: 19500,
      category_id: catMap['womens-shoes'],
      brand_id: brandMap['adidas-originals'],
      description: 'Vintage charm meets modern comfort. The Gazelle is a true original.',
      stock_qty: 18,
      key_benefits: ['Suede upper', 'Retro style'],
      is_active: true,
      is_featured: true,
    },
    {
      name: 'Samba OG',
      slug: 'samba-og',
      price_cents: 24000,
      category_id: catMap['womens-shoes'],
      brand_id: brandMap['adidas-originals'],
      description: 'Indoor soccer heritage meets street style. The Samba never goes out of fashion.',
      stock_qty: 25,
      key_benefits: ['Leather upper', 'Gum sole'],
      is_active: true,
    },
    {
      name: 'Adilette Slides',
      slug: 'adilette-slides',
      price_cents: 8500,
      category_id: catMap['womens-shoes'],
      brand_id: brandMap['adidas-originals'],
      description: 'Post-workout or poolside, Adilette slides are the ultimate in casual comfort.',
      stock_qty: 40,
      key_benefits: ['Quick dry', 'Contoured footbed'],
      is_active: true,
    },
    {
      name: 'Rapid Runner Kids',
      slug: 'rapid-runner-kids',
      price_cents: 12500,
      category_id: catMap['kids-shoes'],
      brand_id: brandMap['adidas-performance'],
      description: 'Lightweight running shoes for active kids. Durable and comfortable.',
      stock_qty: 20,
      key_benefits: ['Lightweight', 'Easy on/off'],
      is_active: true,
    },
    {
      name: 'Grand Court Kids',
      slug: 'grand-court-kids',
      price_cents: 9500,
      category_id: catMap['kids-shoes'],
      brand_id: brandMap['adidas-originals'],
      description: 'Classic tennis style for the next generation.',
      stock_qty: 25,
      key_benefits: ['Classic look', 'Easy closure'],
      is_active: true,
    },
    {
      name: 'Water Sandals Kids',
      slug: 'water-sandals-kids',
      price_cents: 6500,
      category_id: catMap['kids-shoes'],
      brand_id: brandMap['adidas-performance'],
      description: 'Beach and pool ready. Quick-dry and water-friendly.',
      stock_qty: 35,
      key_benefits: ['Water-friendly', 'Quick-dry'],
      is_active: true,
    },
    {
      name: 'Classic Backpack',
      slug: 'classic-backpack',
      price_cents: 8500,
      category_id: catMap['accessories'],
      brand_id: brandMap['adidas-originals'],
      description: 'Carry your gear in style. Classic 3-stripes design.',
      stock_qty: 15,
      key_benefits: ['Durable fabric', 'Laptop compartment'],
      is_active: true,
    },
    {
      name: 'Baseball Cap',
      slug: 'baseball-cap',
      price_cents: 4500,
      category_id: catMap['accessories'],
      brand_id: brandMap['adidas-originals'],
      description: 'Classic 6-panel cap with adjustable strap.',
      stock_qty: 30,
      key_benefits: ['Adjustable fit', 'Pre-curved brim'],
      is_active: true,
    },
    {
      name: 'Crew Socks 3-Pack',
      slug: 'crew-socks-3pack',
      price_cents: 3500,
      category_id: catMap['accessories'],
      brand_id: brandMap['adidas-performance'],
      description: 'All-day comfort with cushioned footbed.',
      stock_qty: 50,
      key_benefits: ['Cushioned', 'Moisture-wicking'],
      is_active: true,
    },
  ];

  for (const product of products) {
    await supabase.from('products').upsert(product, { onConflict: 'slug' });
  }
  console.log('✓ Products seeded');

  // Shipping Methods
  const shippingMethods = [
    { name: 'Standard Delivery', description: 'Island-wide delivery', price_cents: 350, estimated_days: '2-3 days', display_order: 1, is_active: true },
    { name: 'Express Delivery', description: 'Priority shipping', price_cents: 550, estimated_days: '1-2 days', display_order: 2, is_active: true },
    { name: 'Store Pickup', description: 'Collect from Colombo store', price_cents: 0, estimated_days: 'Same day', display_order: 3, is_active: true },
  ];

  for (const method of shippingMethods) {
    await supabase.from('shipping_methods').upsert(method, { onConflict: 'name' });
  }
  console.log('✓ Shipping methods seeded');

  // Promotion
  await supabase.from('promotions').upsert({
    name: 'Welcome Discount',
    code: 'WELCOME10',
    description: '10% off your first order',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_cents: 5000,
    max_discount_cents: 2500,
    is_active: true,
  }, { onConflict: 'code' });
  console.log('✓ Promotion seeded');

  console.log('\n✅ Database seeding complete!');
  console.log('\nDemo data created:');
  console.log('- 4 Categories');
  console.log('- 2 Brands');
  console.log('- 13 Products');
  console.log('- 3 Shipping Methods');
  console.log('- 1 Promotion (WELCOME10)');
}

seedDatabase().catch(console.error);