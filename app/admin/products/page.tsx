'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatPriceCents } from '@/lib/types/database';
import type { Product, Brand, Category, ProductImage } from '@/lib/types/database';
import { Icon } from '@/components/admin/ui/Icon';
import { ProductForm } from '@/components/admin/ProductForm';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<(Product & { brands?: Brand; categories?: Category; product_images?: ProductImage[] })[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product & { brands?: Brand; categories?: Category; images?: ProductImage[] } | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, brands(name), categories(name), product_images(url)').order('created_at', { ascending: false }),
        supabase.from('brands').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ]);

      const productsList = (productsRes.data || []).map(p => ({
        ...p,
        brands: (p as any).brands,
        categories: (p as any).categories,
        product_images: p.product_images as ProductImage[],
      }));

      setProducts(productsList);
      setBrands(brandsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleAddNew() {
    setEditingProduct(undefined);
    setShowForm(true);
  }

  function handleEdit(product: Product & { brands?: Brand; categories?: Category; images?: ProductImage[] }) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingProduct(undefined);
  }

  function handleSave() {
    loadData();
    handleCloseForm();
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await supabase.from('products').delete().eq('id', product.id);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete product');
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Products</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {products.length} products total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
            <Icon name="arrow_back" className="text-sm" />
            Back to Dashboard
          </Link>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
          >
            <Icon name="add" className="text-sm" />
            Add Product
          </button>
        </div>
      </div>

      {products.length > 0 && (
        <div className="relative max-w-md">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface rounded-lg border border-outline-variant/10 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">Loading...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-8 text-center">
          <p className="text-on-surface-variant">No products yet</p>
          <button
            onClick={handleAddNew}
            className="mt-4 text-primary hover:underline"
          >
            Add your first product
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Product</th>
                  <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Brand</th>
                  <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Category</th>
                  <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Status</th>
                  <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Price</th>
                  <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Stock</th>
                  <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filteredProducts.map(product => {
                  const image = product.product_images?.[0];
                  return (
                    <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {image?.url && (
                            <img src={image.url} alt="" className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <span className="font-medium text-sm">{product.name}</span>
                            <p className="text-xs text-on-surface-variant">SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {product.brands?.name || '-'}
                      </td>
                      <td className="p-4 text-sm">
                        {product.categories?.name || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold">
                        {formatPriceCents(product.price_cents)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-sm font-medium ${
                          (product.stock_qty ?? 0) < 5 ? 'text-error' : 
                          (product.stock_qty ?? 0) < (product.low_stock_threshold ?? 5) ? 'text-tertiary' : ''
                        }`}>
                          {product.stock_qty ?? 0}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(product as any)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded transition-colors"
                            title="Edit"
                          >
                            <Icon name="edit" className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded transition-colors"
                            title="Delete"
                          >
                            <Icon name="delete" className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          brands={brands}
          categories={categories}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}