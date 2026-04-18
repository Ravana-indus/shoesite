import { AuthProvider } from '@/components/admin/AuthProvider';
import { OrderProvider } from '@/components/admin/OrderProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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