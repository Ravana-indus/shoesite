import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountNav } from '@/components/account/AccountNav';
import { ProfileForm } from '@/components/account/ProfileForm';
import { updateProfile, getProfile } from '@/lib/actions/account';
import { Package, Heart } from 'lucide-react';
import Link from 'next/link';

export default async function AccountPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/account');
  }
  
  const data = await getProfile();
  
  if (!data?.profile) {
    return <div>Error loading profile</div>;
  }
  
  const { profile, orderCount, wishlistCount } = data;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <AccountNav />
            </div>
            <div className="md:col-span-3 space-y-8">
              <h1 className="font-display text-2xl font-bold uppercase">My Account</h1>
              
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/account/orders"
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <Package className="w-8 h-8 mb-2" />
                  <p className="text-2xl font-bold">{orderCount}</p>
                  <p className="text-gray-600">Orders</p>
                </Link>
                
                <Link
                  href="/wishlist"
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <Heart className="w-8 h-8 mb-2" />
                  <p className="text-2xl font-bold">{wishlistCount}</p>
                  <p className="text-gray-600">Wishlist Items</p>
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-display text-lg font-bold uppercase mb-6">Profile Information</h2>
                <ProfileForm profile={profile} onSave={updateProfile} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}