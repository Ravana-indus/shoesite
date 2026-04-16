import { createClient } from '@/utils/supabase/server';
import { Icon } from '@/components/admin/ui/Icon';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const usersList = profiles || [];

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Users</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {usersList.length} users total
          </p>
        </div>
        <Link href="/admin" className="text-sm text-secondary hover:text-primary flex items-center gap-1">
          <Icon name="arrow_back" className="text-sm" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">User</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Email</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Role</th>
                <th className="text-left text-xs text-on-surface-variant uppercase tracking-widest p-4">Verified</th>
                <th className="text-right text-xs text-on-surface-variant uppercase tracking-widest p-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {usersList.map(user => (
                <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                          <Icon name="person" className="text-on-primary-container" />
                        </div>
                      )}
                      <span className="font-medium text-sm">{user.full_name || '-'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{user.email}</td>
                  <td className="p-4">
                    <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role || 'customer'}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.is_verified ? (
                      <Icon name="verified" className="text-green-600" />
                    ) : (
                      <Icon name="close" className="text-gray-400" />
                    )}
                  </td>
                  <td className="p-4 text-right text-sm text-on-surface-variant">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}