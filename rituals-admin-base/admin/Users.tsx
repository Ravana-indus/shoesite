import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Profile } from '../../types/database';
import { Icon } from '../../components/ui/Icon';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const data = await api.admin.getAllUsers();
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateRole(userId: string, role: string) {
    await api.admin.updateUserRole(userId, role);
    await loadUsers();
  }

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-noto-serif text-primary">Users</h1>
          <p className="text-sm text-on-surface-variant mt-1">{users.length} registered users</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/10 text-xs uppercase tracking-widest text-on-surface-variant">
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Joined</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                <td className="p-4"><p className="text-sm font-medium">{user.full_name ?? '—'}</p></td>
                <td className="p-4 text-sm">{user.email}</td>
                <td className="p-4">
                  <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                    user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'admin' ? 'bg-primary-container text-on-primary-container' :
                    'bg-surface-container text-on-surface-variant'
                  }`}>{user.role ?? 'customer'}</span>
                </td>
                <td className="p-4 text-xs text-on-surface-variant">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-LK') : '—'}</td>
                <td className="p-4">
                  <select value={user.role ?? 'customer'} onChange={e => updateRole(user.id, e.target.value)} className="bg-surface-container text-xs px-2 py-1 rounded border border-outline-variant/20 cursor-pointer">
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-12 text-center text-on-surface-variant">
            <Icon name="people" className="text-4xl mb-3 opacity-30" />
            <p>No users registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
