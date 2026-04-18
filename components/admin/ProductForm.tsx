'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatPriceCents, parsePriceString } from '@/lib/types/database';
import type { Product, Brand, Category, ProductImage, ProductInsert, ProductUpdate } from '@/lib/types/database';
import { Icon } from './ui/Icon';

interface ProductFormProps {
  product?: Product & { brand?: Brand; category?: Category; images?: ProductImage[] };
  brands: Brand[];
  categories: Category[];
  onSave: () => void;
  onClose: () => void;
}

const emptyForm: Record<string, unknown> = {
  brand_id: '',
  category_id: '',
  name: '',
  slug: '',
  tagline: '',
  description: '',
  how_to_use: '',
  ingredients: '',
  key_benefits: '',
  price_cents: 0,
  compare_at_price_cents: 0,
  sku: '',
  barcode: '',
  weight_grams: 0,
  stock_qty: 0,
  low_stock_threshold: 5,
  is_featured: false,
  is_active: true,
};

export function ProductForm({ product, brands, categories, onSave, onClose }: ProductFormProps) {
  const [form, setForm] = useState<Record<string, unknown>>(emptyForm);
  const [images, setImages] = useState<{ url: string; alt_text: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [comparePriceInput, setComparePriceInput] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (product) {
      setForm({
        brand_id: product.brand_id ?? '',
        category_id: product.category_id ?? '',
        name: product.name ?? '',
        slug: product.slug ?? '',
        tagline: product.tagline ?? '',
        description: product.description ?? '',
        how_to_use: product.how_to_use ?? '',
        ingredients: product.ingredients ?? '',
        key_benefits: product.key_benefits ?? '',
        price_cents: product.price_cents ?? 0,
        compare_at_price_cents: product.compare_at_price_cents ?? 0,
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        weight_grams: product.weight_grams ?? 0,
        stock_qty: product.stock_qty ?? 0,
        low_stock_threshold: product.low_stock_threshold ?? 5,
        is_featured: product.is_featured ?? false,
        is_active: product.is_active ?? true,
      });
      setImages(product.images?.map(img => ({ url: img.url ?? '', alt_text: img.alt_text ?? '' })) ?? []);
      setPriceInput(product.price_cents ? String(product.price_cents) : '');
      setComparePriceInput(product.compare_at_price_cents ? String(product.compare_at_price_cents) : '');
    } else {
      setPriceInput('');
      setComparePriceInput('');
    }
    dialogRef.current?.showModal();
  }, [product]);

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function makeSlug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.brand_id || !form.category_id || !form.name || !form.slug) {
      setError('Brand, category, name, and slug are required.');
      return;
    }
    if ((form.price_cents as number) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }
    setSaving(true);
    try {
      let saved: Product;
      if (product) {
        const { data, error: updateError } = await supabase
          .from('products')
          .update(form as ProductUpdate)
          .eq('id', product.id)
          .select()
          .single();
        if (updateError) throw updateError;
        if (!data) throw new Error('Failed to update product');
        saved = data;
      } else {
        const { data, error: insertError } = await supabase
          .from('products')
          .insert(form as ProductInsert)
          .select()
          .single();
        if (insertError) throw insertError;
        if (!data) throw new Error('Failed to create product');
        saved = data;
      }
      for (const img of images) {
        if (img.url && !product?.images?.some(p => p.url === img.url)) {
          await supabase.from('product_images').insert({
            product_id: saved.id,
            url: img.url,
            alt_text: img.alt_text || img.url.split('/').pop() || '',
          });
        }
      }
      onSave();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteImage(img: ProductImage) {
    if (!product) return;
    try {
      await supabase.from('product_images').delete().eq('id', img.id);
      setImages(imgs => imgs.filter(i => i.url !== img.url));
      onSave();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to remove image.');
    }
  }

  function addImageUrl() {
    setImages(imgs => [...imgs, { url: '', alt_text: '' }]);
  }

  function removeImageUrl(idx: number) {
    setImages(imgs => imgs.filter((_, i) => i !== idx));
  }

  function updateImageUrl(idx: number, field: 'url' | 'alt_text', value: string) {
    setImages(imgs => imgs.map((img, i) => i === idx ? { ...img, [field]: value } : img));
  }

  function handlePriceChange(val: string, field: 'price_cents' | 'compare_at_price_cents', setter: (val: string) => void) {
    setter(val);
    set(field, parsePriceString(val));
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 m-auto max-w-3xl w-[95vw] max-h-[90vh] bg-surface rounded-2xl border border-outline-variant/10 shadow-2xl backdrop:bg-black/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
        <h2 className="text-xl font-noto-serif text-primary">{product ? 'Edit Product' : 'New Product'}</h2>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors">
          <Icon name="close" className="text-lg" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <Icon name="error" className="text-sm" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Product Name *</label>
            <input
              value={form.name as string}
              onChange={e => { set('name', e.target.value); if (!product) set('slug', makeSlug(e.target.value)); }}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Rose Glow Serum"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Slug *</label>
            <input
              value={form.slug as string}
              onChange={e => set('slug', makeSlug(e.target.value))}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
              placeholder="rose-glow-serum"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Brand *</label>
            <select
              value={form.brand_id as string}
              onChange={e => set('brand_id', e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              required
            >
              <option value="">Select brand</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Category *</label>
            <select
              value={form.category_id as string}
              onChange={e => set('category_id', e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              required
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Tagline</label>
            <input
              value={form.tagline as string}
              onChange={e => set('tagline', e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              placeholder="A short, memorable description"
              maxLength={200}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Description</label>
            <textarea
              value={form.description as string}
              onChange={e => set('description', e.target.value)}
              rows={4}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              placeholder="Full product description..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">How to Use</label>
            <textarea
              value={form.how_to_use as string}
              onChange={e => set('how_to_use', e.target.value)}
              rows={2}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              placeholder="Application instructions..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Ingredients</label>
            <textarea
              value={form.ingredients as string}
              onChange={e => set('ingredients', e.target.value)}
              rows={2}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              placeholder="Full ingredient list..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Key Benefits (one per line)</label>
            <textarea
              value={form.key_benefits as string}
              onChange={e => set('key_benefits', e.target.value)}
              rows={3}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              placeholder="Deep hydration&#10;Anti-aging properties&#10;Lightweight formula"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Price (LKR) *</label>
            <input
              type="text"
              value={priceInput}
              onChange={e => handlePriceChange(e.target.value, 'price_cents', setPriceInput)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              required
            />
            {(form.price_cents as number) > 0 && (
              <p className="text-xs text-on-surface-variant mt-1">= {formatPriceCents(form.price_cents as number)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Compare At Price (LKR)</label>
            <input
              type="text"
              value={comparePriceInput}
              onChange={e => handlePriceChange(e.target.value, 'compare_at_price_cents', setComparePriceInput)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Stock Qty</label>
            <input
              type="number"
              min="0"
              value={form.stock_qty as number}
              onChange={e => set('stock_qty', parseInt(e.target.value) || 0)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Low Stock Threshold</label>
            <input
              type="number"
              min="0"
              value={form.low_stock_threshold as number}
              onChange={e => set('low_stock_threshold', parseInt(e.target.value) || 0)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">SKU</label>
            <input
              value={form.sku as string}
              onChange={e => set('sku', e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
              placeholder="SKU-001"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Barcode</label>
            <input
              value={form.barcode as string}
              onChange={e => set('barcode', e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
              placeholder="012345678901"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Weight (grams)</label>
            <input
              type="number"
              min="0"
              value={form.weight_grams as number}
              onChange={e => set('weight_grams', parseInt(e.target.value) || 0)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured as boolean}
                onChange={e => set('is_featured', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active as boolean}
                onChange={e => set('is_active', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant">Product Images</label>
              <button
                type="button"
                onClick={addImageUrl}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Icon name="add" className="text-sm" /> Add Image URL
              </button>
            </div>
            {images.length === 0 && (
              <p className="text-xs text-on-surface-variant">No images. Add image URLs below.</p>
            )}
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={img.url}
                    onChange={e => updateImageUrl(idx, 'url', e.target.value)}
                    className="flex-1 bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs font-mono"
                    placeholder="https://storage.googleapis.com/..."
                  />
                  <input
                    value={img.alt_text}
                    onChange={e => updateImageUrl(idx, 'alt_text', e.target.value)}
                    className="flex-1 bg-surface-container-low border-none rounded-lg px-3 py-2 text-xs"
                    placeholder="Alt text (optional)"
                  />
                  {product?.images && (
                    <button
                      type="button"
                      onClick={() => {
                        const found = product.images?.find(p => p.url === img.url);
                        if (found) handleDeleteImage(found);
                        removeImageUrl(idx);
                      }}
                      className="p-1.5 text-error hover:bg-error-container rounded transition-colors"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  )}
                  {!product && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(idx)}
                      className="p-1.5 text-error hover:bg-error-container rounded transition-colors"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/10">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Icon name="progress_activity" className="text-sm animate-spin" />}
            {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-surface-container-high text-on-surface-variant px-6 py-2.5 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}