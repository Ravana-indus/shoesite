import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountNav } from '@/components/account/AccountNav';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login?redirect=/account');
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <AccountNav />
            </div>
            <div className="md:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}