import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Product, Brand, Category, ProductImage } from '../../types/database';
import { formatPriceCents } from '../../types/database';
import ProductForm from '../../components/admin/ProductForm';
import { Icon } from '../../components/ui/Icon';

type ProductWithRelations = Product & { brand: Brand; category: Category; images: ProductImage[] };

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [productsData, brandsData, categoriesData] = await Promise.all([
        api.products.getAllAdmin(),
        api.brands.getAll(),
        api.categories.getAll(),
      ]);
      setProducts(productsData as ProductWithRelations[]);
      setBrands(brandsData);
      setCategories(categoriesData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function handleAdd() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function handleEdit(product: ProductWithRelations) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.products.delete(id);
    await loadData();
  }

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Products</h1>
          <p className="text-sm text-on-surface-variant mt-1">{products.length} products in catalog</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90"
        >
          <Icon name="add" className="text-sm" /> Add Product
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/10 text-xs uppercase tracking-widest text-on-surface-variant">
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Brand</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-surface-container-low transition-colors">
                <td className="p-4">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-on-surface-variant">{product.sku ?? 'No SKU'}</p>
                </td>
                <td className="p-4 text-sm">{product.brand?.name ?? '—'}</td>
                <td className="p-4 text-sm">{product.category?.name ?? '—'}</td>
                <td className="p-4">
                  <p className="text-sm font-semibold">{formatPriceCents(product.price_cents)}</p>
                  {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents && (
                    <p className="text-xs text-on-surface-variant line-through">{formatPriceCents(product.compare_at_price_cents)}</p>
                  )}
                </td>
                <td className="p-4">
                  <span className={`text-sm font-semibold ${(product.stock_qty ?? 0) <= (product.low_stock_threshold ?? 5) ? 'text-tertiary' : ''}`}>
                    {product.stock_qty ?? 0}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    {product.is_featured && (
                      <span className="w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center" title="Featured">
                        <Icon name="star" className="text-[8px] text-secondary" />
                      </span>
                    )}
                    {product.is_active ? (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Icon name="edit" className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
                      title="Delete"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <Icon name="inventory_2" className="text-4xl mb-3 opacity-30" />
            <p>No products yet. Add your first product to get started.</p>
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct ?? undefined}
          brands={brands}
          categories={categories}
          onSave={loadData}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
