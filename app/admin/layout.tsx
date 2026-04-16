import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AuthProvider } from '@/components/admin/AuthProvider';
import { OrderProvider } from '@/components/admin/OrderProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/');
  }

  return (
    <AuthProvider>
      <OrderProvider>
        <div className="min-h-screen bg-surface-container-low">
          <AdminSidebar />
          <main className="lg:pl-60 min-h-screen">
            {children}
          </main>
        </div>
      </OrderProvider>
    </AuthProvider>
  );
}