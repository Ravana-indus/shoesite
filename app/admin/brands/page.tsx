import { createClient } from '@/utils/supabase/server';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default async function AdminBrandsPage() {
  const supabase = await createClient();

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  const brandsList = brands || [];

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Brands</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {brandsList.length} brands total
          </p>
        </div>
        <Link href="/admin" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
          <Icon name="arrow_back" className="text-sm" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brandsList.map(brand => (
          <div key={brand.id} className="bg-surface rounded-xl border border-outline-variant/10 p-4 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3">
              {brand.logo_url && (
                <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 object-contain" />
              )}
              <div>
                <h3 className="font-medium">{brand.name}</h3>
                <p className="text-xs text-on-surface-variant">{brand.slug}</p>
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
        {brandsList.length === 0 && (
          <div className="col-span-full p-8 text-center text-on-surface-variant">
            No brands yet
          </div>
        )}
      </div>
    </div>
  );
}