import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../components/ui/Icon';

interface StoreSetting {
  key: string;
  value: any;
  description: string | null;
  is_public: boolean | null;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const { data } = await supabase.from('store_settings').select('*').order('key');
      setSettings(data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateSetting(key: string, value: any) {
    await supabase.from('store_settings').update({ value }).eq('key', key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await loadSettings();
  }

  function getValue(key: string): string {
    const s = settings.find(s => s.key === key);
    if (!s) return '';
    return typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
  }

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Store Settings</h1>
          <p className="text-sm text-on-surface-variant mt-1">Configure your store preferences</p>
        </div>
        {saved && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Icon name="check_circle" className="text-sm" /> Saved
          </span>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10">
        {[
          { key: 'store_name', label: 'Store Name', desc: 'Display name for the store' },
          { key: 'store_tagline', label: 'Tagline', desc: 'Store tagline' },
          { key: 'contact_email', label: 'Contact Email', desc: 'Customer support email' },
          { key: 'contact_phone', label: 'Contact Phone', desc: 'Customer support phone' },
          { key: 'currency', label: 'Currency', desc: 'Currency code (e.g. LKR)' },
          { key: 'currency_symbol', label: 'Currency Symbol', desc: 'Display symbol (e.g. Rs.)' },
          { key: 'free_shipping_threshold_cents', label: 'Free Shipping Threshold (cents)', desc: 'Order value in cents for free shipping' },
          { key: 'standard_shipping_cents', label: 'Standard Shipping Cost (cents)', desc: 'Standard shipping cost in cents' },
          { key: 'express_shipping_cents', label: 'Express Shipping Cost (cents)', desc: 'Express shipping cost in cents' },
          { key: 'payhere_merchant_id', label: 'PayHere Merchant ID', desc: 'Your PayHere merchant ID' },
          { key: 'payhere_callback_url', label: 'PayHere Callback URL', desc: 'PayHere payment callback URL' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="p-6 flex items-center justify-between gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold">{label}</label>
              <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
            </div>
            <input
              type="text"
              defaultValue={getValue(key)}
              onBlur={e => updateSetting(key, e.target.value)}
              className="w-64 bg-surface-container-low border-none rounded-lg px-4 py-2 text-sm text-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
