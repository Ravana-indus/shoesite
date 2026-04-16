import { Product as ShopifyProduct } from './types';
import { Product as UIProduct } from '@/components/product/ProductCard';

export function mapShopifyProduct(product: ShopifyProduct): UIProduct {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAtAmount = product.compareAtPriceRange?.minVariantPrice?.amount;
  const originalPrice = compareAtAmount ? parseFloat(compareAtAmount) : undefined;

  // Attempt to categorize based on tags (e.g., 'Running', 'Originals')
  const category = product.tags?.[0] || 'Sneakers';
  
  const isNew = product.tags?.includes('new');
  const isBestseller = product.tags?.includes('bestseller');

  // Sum up total inventory (mocked from options here, but typically you'd query variant inventoryQuantities)
  // For a headless build without inventory tokens, we can mock low stock randomly or via a specific tag
  const stockRemaining = product.tags?.includes('low-stock') ? 3 : undefined;

  return {
    id: product.id,
    name: product.title,
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    image: product.featuredImage?.url || '/products/placeholder.jpg',
    category,
    isNew,
    isBestseller,
    stockRemaining,
  };
}
