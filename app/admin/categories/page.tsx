import { createClient } from '@/utils/supabase/server';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const categoriesList = categories || [];

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Categories</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {categoriesList.length} categories total
          </p>
        </div>
        <Link href="/admin" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
          <Icon name="arrow_back" className="text-sm" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesList.map(category => (
          <div key={category.id} className="bg-surface rounded-xl border border-outline-variant/10 p-4 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3">
              {category.icon_name && (
                <Icon name={category.icon_name} className="text-2xl text-tertiary" />
              )}
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-xs text-on-surface-variant">/{category.slug}</p>
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
        {categoriesList.length === 0 && (
          <div className="col-span-full p-8 text-center text-on-surface-variant">
            No categories yet
          </div>
        )}
      </div>
    </div>
  );
}