'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { Category, CategoryInsert } from '@/lib/types/database';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleAddNew() {
    setEditingCategory(undefined);
    setShowForm(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingCategory(undefined);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string || null,
      icon_name: formData.get('icon_name') as string || null,
      is_active: formData.get('is_active') === 'on',
    };

    if (!data.name || !data.slug) {
      alert('Name and slug are required');
      return;
    }

    try {
      if (editingCategory) {
        await supabase.from('categories').update(data).eq('id', editingCategory.id);
      } else {
        await supabase.from('categories').insert(data as CategoryInsert);
      }
      loadCategories();
      handleCloseForm();
    } catch (e) {
      console.error(e);
      alert('Failed to save category');
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      await supabase.from('categories').delete().eq('id', category.id);
      loadCategories();
    } catch (e) {
      console.error(e);
      alert('Failed to delete category');
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Categories</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {categories.length} categories total
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
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-8 text-center">
          <p className="text-on-surface-variant">No categories yet</p>
          <button onClick={handleAddNew} className="mt-4 text-primary hover:underline">Add your first category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div key={category.id} className="bg-surface rounded-xl border border-outline-variant/10 p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                {category.icon_name && (
                  <Icon name={category.icon_name} className="text-2xl text-tertiary" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-xs text-on-surface-variant">/{category.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(category)} className="p-1 text-on-surface-variant hover:text-primary" title="Edit">
                    <Icon name="edit" className="text-sm" />
                  </button>
                  <button onClick={() => handleDelete(category)} className="p-1 text-on-surface-variant hover:text-error" title="Delete">
                    <Icon name="delete" className="text-sm" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{category.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
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
            <h2 className="text-xl font-noto-serif">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Name *</label>
              <input
                name="name"
                defaultValue={editingCategory?.name}
                onChange={e => {
                  const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  const slugInput = document.getElementById('category-slug') as HTMLInputElement;
                  if (slugInput && !editingCategory) slugInput.value = slug;
                }}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                placeholder="Category Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Slug *</label>
              <input
                id="category-slug"
                name="slug"
                defaultValue={editingCategory?.slug}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
                placeholder="category-slug"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Description</label>
              <textarea
                name="description"
                defaultValue={editingCategory?.description || ''}
                rows={2}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                placeholder="Brief description..."
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Icon Name</label>
              <input
                name="icon_name"
                defaultValue={editingCategory?.icon_name || ''}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                placeholder="spa, face, brush, etc."
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editingCategory?.is_active ?? true}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
              <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold">
                {editingCategory ? 'Update' : 'Create'}
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