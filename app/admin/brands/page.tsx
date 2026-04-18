'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Brand, BrandInsert } from '@/lib/types/database';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    try {
      const { data } = await supabase.from('brands').select('*').order('name');
      setBrands(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleAddNew() {
    setEditingBrand(undefined);
    setShowForm(true);
  }

  function handleEdit(brand: Brand) {
    setEditingBrand(brand);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingBrand(undefined);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string || null,
      logo_url: formData.get('logo_url') as string || null,
      website: formData.get('website') as string || null,
      country_of_origin: formData.get('country_of_origin') as string || null,
      is_active: formData.get('is_active') === 'on',
    };

    if (!data.name || !data.slug) {
      alert('Name and slug are required');
      return;
    }

    try {
      if (editingBrand) {
        await supabase.from('brands').update(data).eq('id', editingBrand.id);
      } else {
        await supabase.from('brands').insert(data as BrandInsert);
      }
      loadBrands();
      handleCloseForm();
    } catch (e) {
      console.error(e);
      alert('Failed to save brand');
    }
  }

  async function handleDelete(brand: Brand) {
    if (!confirm(`Delete brand "${brand.name}"?`)) return;
    try {
      await supabase.from('brands').delete().eq('id', brand.id);
      loadBrands();
    } catch (e) {
      console.error(e);
      alert('Failed to delete brand');
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Brands</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {brands.length} brands total
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
            Add Brand
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">Loading...</div>
      ) : brands.length === 0 ? (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-8 text-center">
          <p className="text-on-surface-variant">No brands yet</p>
          <button onClick={handleAddNew} className="mt-4 text-primary hover:underline">Add your first brand</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="bg-surface rounded-xl border border-outline-variant/10 p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                {brand.logo_url && (
                  <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 object-contain" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{brand.name}</h3>
                  <p className="text-xs text-on-surface-variant">{brand.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(brand)} className="p-1 text-on-surface-variant hover:text-primary" title="Edit">
                    <Icon name="edit" className="text-sm" />
                  </button>
                  <button onClick={() => handleDelete(brand)} className="p-1 text-on-surface-variant hover:text-error" title="Delete">
                    <Icon name="delete" className="text-sm" />
                  </button>
                </div>
              </div>
              {brand.description && (
                <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{brand.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  brand.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {brand.is_active ? 'Active' : 'Inactive'}
                </span>
                {brand.country_of_origin && (
                  <span className="text-xs text-on-surface-variant">{brand.country_of_origin}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <dialog
          ref={dialogRef}
          onClose={handleCloseForm}
          className="fixed inset-0 m-auto max-w-md w-[95vw] bg-surface rounded-2xl border border-outline-variant/10 shadow-2xl backdrop:bg-black/50"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-xl font-noto-serif">{editingBrand ? 'Edit Brand' : 'New Brand'}</h2>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Name *</label>
              <input
                name="name"
                defaultValue={editingBrand?.name}
                onChange={e => {
                  const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  const slugInput = document.getElementById('brand-slug') as HTMLInputElement;
                  if (slugInput && !editingBrand) slugInput.value = slug;
                }}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                placeholder="Brand Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Slug *</label>
              <input
                id="brand-slug"
                name="slug"
                defaultValue={editingBrand?.slug}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
                placeholder="brand-slug"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Description</label>
              <textarea
                name="description"
                defaultValue={editingBrand?.description || ''}
                rows={2}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                placeholder="Brief description..."
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Logo URL</label>
              <input
                name="logo_url"
                defaultValue={editingBrand?.logo_url || ''}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Website</label>
              <input
                name="website"
                defaultValue={(editingBrand as any)?.website || ''}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Country of Origin</label>
              <input
                name="country_of_origin"
                defaultValue={editingBrand?.country_of_origin || ''}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                placeholder="Sri Lanka"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editingBrand?.is_active ?? true}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
              <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold">
                {editingBrand ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={handleCloseForm} className="bg-surface-container-high px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}