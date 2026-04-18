'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ProfileFormProps {
  profile: {
    full_name: string | null;
    email: string;
    phone: string | null;
  };
  onSave: (data: { full_name: string; phone: string }) => Promise<void>;
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      await onSave(formData);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-500"
        />
        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="+94 77 123 4567"
        />
      </div>
      
      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}