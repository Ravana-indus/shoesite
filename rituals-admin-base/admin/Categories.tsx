import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Category } from '../../types/database';
import { Icon } from '../../components/ui/Icon';

const emptyForm = { name: '', slug: '', description: '', icon_name: '', parent_id: '', display_order: 0, is_active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function makeSlug(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name ?? '',
      slug: cat.slug ?? '',
      description: cat.description ?? '',
      icon_name: cat.icon_name ?? '',
      parent_id: cat.parent_id ?? '',
      display_order: cat.display_order ?? 0,
      is_active: cat.is_active ?? true,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parent_id: form.parent_id || null, display_order: form.display_order || 0 };
      if (editingId) {
        await api.categories.update(editingId, payload);
      } else {
        await api.categories.create(payload as Parameters<typeof api.categories.create>[0]);
      }
      await loadCategories();
      closeForm();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hide this category?')) return;
    await api.categories.delete(id);
    await loadCategories();
  }

  async function handleRestore(id: string) {
    await api.categories.update(id, { is_active: true });
    await loadCategories();
  }

  function parentName(parentId: string) {
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : '—';
  }

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Categories</h1>
          <p className="text-sm text-on-surface-variant mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Icon name="add" className="text-sm" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
          <h2 className="font-noto-serif text-lg mb-4">{editingId ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: editingId ? f.slug : makeSlug(e.target.value) })); }}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Slug *</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: makeSlug(e.target.value) }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Parent Category</label>
                <select
                  value={form.parent_id}
                  onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                >
                  <option value="">None (top-level)</option>
                  {categories.filter(c => c.id !== editingId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Icon Name</label>
                <input
                  value={form.icon_name}
                  onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
                  placeholder="e.g. spa, beauty, nature"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" onClick={closeForm} className="bg-surface-container-high text-on-surface-variant px-6 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className={`bg-surface rounded-xl border border-outline-variant/10 p-5 hover:shadow-md transition-shadow ${!cat.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-noto-serif text-lg truncate">{cat.name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">/{cat.slug}</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            </div>
            {cat.parent_id && <p className="text-xs text-on-surface-variant mt-2">Parent: {parentName(cat.parent_id)}</p>}
            {cat.description && <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{cat.description}</p>}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/5">
              <button
                onClick={() => openEdit(cat)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-surface-container-high text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                <Icon name="edit" className="text-sm" /> Edit
              </button>
              {cat.is_active ? (
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-error-container text-xs text-on-surface-variant hover:text-error transition-colors"
                >
                  <Icon name="delete" className="text-sm" /> Hide
                </button>
              ) : (
                <button
                  onClick={() => handleRestore(cat.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-green-500/10 text-xs text-on-surface-variant hover:text-green-600 transition-colors"
                >
                  <Icon name="restore" className="text-sm" /> Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-12 text-center text-on-surface-variant">
          <p>No categories yet.</p>
        </div>
      )}
    </div>
  );
}
