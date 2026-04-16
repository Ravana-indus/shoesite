import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Brand } from '../../types/database';
import { Icon } from '../../components/ui/Icon';

const emptyForm = { name: '', slug: '', description: '', country_of_origin: '', logo_url: '', is_active: true };

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadBrands(); }, []);

  async function loadBrands() {
    try {
      const data = await api.brands.getAll();
      setBrands(data);
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

  function openEdit(brand: Brand) {
    setEditingId(brand.id);
    setForm({
      name: brand.name ?? '',
      slug: brand.slug ?? '',
      description: brand.description ?? '',
      country_of_origin: brand.country_of_origin ?? '',
      logo_url: brand.logo_url ?? '',
      is_active: brand.is_active ?? true,
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
      if (editingId) {
        await api.brands.update(editingId, form);
      } else {
        await api.brands.create(form);
      }
      await loadBrands();
      closeForm();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete (soft) this brand?')) return;
    await api.brands.delete(id);
    await loadBrands();
  }

  async function handleRestore(id: string) {
    await api.brands.update(id, { is_active: true });
    await loadBrands();
  }

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Brands</h1>
          <p className="text-sm text-on-surface-variant mt-1">{brands.length} brands</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Icon name="add" className="text-sm" /> Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-6">
          <h2 className="font-noto-serif text-lg mb-4">{editingId ? 'Edit Brand' : 'New Brand'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Country of Origin</label>
              <input
                value={form.country_of_origin}
                onChange={e => setForm(f => ({ ...f, country_of_origin: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Logo URL</label>
              <input
                value={form.logo_url}
                onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm font-mono"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-on-surface-variant mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-6">
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
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update Brand' : 'Create Brand'}
              </button>
              <button type="button" onClick={closeForm} className="bg-surface-container-high text-on-surface-variant px-6 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(brand => (
          <div key={brand.id} className={`bg-surface rounded-xl border border-outline-variant/10 p-5 hover:shadow-md transition-shadow ${!brand.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-noto-serif text-lg truncate">{brand.name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">/{brand.slug}</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${brand.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            </div>
            {brand.country_of_origin && <p className="text-xs text-on-surface-variant mt-3">Origin: {brand.country_of_origin}</p>}
            {brand.description && <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{brand.description}</p>}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant/5">
              <button
                onClick={() => openEdit(brand)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-surface-container-high text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                <Icon name="edit" className="text-sm" /> Edit
              </button>
              {brand.is_active ? (
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-error-container text-xs text-on-surface-variant hover:text-error transition-colors"
                >
                  <Icon name="delete" className="text-sm" /> Hide
                </button>
              ) : (
                <button
                  onClick={() => handleRestore(brand.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-green-500/10 text-xs text-on-surface-variant hover:text-green-600 transition-colors"
                >
                  <Icon name="restore" className="text-sm" /> Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {brands.length === 0 && (
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-12 text-center text-on-surface-variant">
          <Icon name="category" className="text-4xl mb-3 opacity-30" />
          <p>No brands yet.</p>
        </div>
      )}
    </div>
  );
}
