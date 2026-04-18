'use server';

import { createServerClient } from '@/lib/supabase';

export async function updateProfile(data: { full_name: string; phone: string }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) throw error;
}

export async function getProfile() {
  const supabase = createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  const { count: wishlistCount } = await supabase
    .from('wishlist')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  
  return { profile, orderCount: orderCount || 0, wishlistCount: wishlistCount || 0 };
}