import { shopifyFetch } from './client';
import { getCartQuery, getCollectionProductsQuery, getProductQuery, getProductsQuery } from './queries';
import { addToCartMutation, createCartMutation, removeFromCartMutation, updateCartMutation } from './mutations';
import { Cart, Collection, Product, ProductVariant } from './types';

export async function getProduct(handle: string): Promise<Product | undefined> {
  const res = await shopifyFetch<{ product: Product }>({
    query: getProductQuery,
    variables: { handle }
  });
  return res.body?.product;
}

export async function getCollectionProducts(handle: string): Promise<Product[]> {
  const res = await shopifyFetch<{ collection: { products: { edges: { node: Product }[] } } }>({
    query: getCollectionProductsQuery,
    variables: { handle }
  });
  return res.body?.collection?.products?.edges?.map((edge) => edge.node) || [];
}

export async function getProducts(query?: string): Promise<Product[]> {
  const res = await shopifyFetch<{ products: { edges: { node: Product }[] } }>({
    query: getProductsQuery,
    variables: { query }
  });
  return res.body?.products?.edges?.map((edge) => edge.node) || [];
}

export async function getCart(cartId: string): Promise<Cart | undefined> {
  const res = await shopifyFetch<{ cart: Cart }>({
    query: getCartQuery,
    variables: { cartId },
    cache: 'no-store'
  });
  return res.body?.cart;
}

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<{ cartCreate: { cart: Cart } }>({
    query: createCartMutation,
    cache: 'no-store'
  });
  return res.body?.cartCreate?.cart;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>({
    query: addToCartMutation,
    variables: { cartId, lines },
    cache: 'no-store'
  });
  return res.body?.cartLinesAdd?.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
  const res = await shopifyFetch<{ cartLinesRemove: { cart: Cart } }>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds },
    cache: 'no-store'
  });
  return res.body?.cartLinesRemove?.cart;
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const res = await shopifyFetch<{ cartLinesUpdate: { cart: Cart } }>({
    query: updateCartMutation,
    variables: { cartId, lines },
    cache: 'no-store'
  });
  return res.body?.cartLinesUpdate?.cart;
}
