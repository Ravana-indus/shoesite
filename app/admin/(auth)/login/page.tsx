'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Icon } from '@/components/admin/ui/Icon';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setError('Check your email for the confirmation link!');
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const redirectTo = typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('redirect') : null;
    router.push(redirectTo || '/admin');
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-xl border border-outline-variant/10 p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary-container/30 rounded-full mb-4">
              <Icon name="admin_panel_settings" className="text-tertiary text-3xl" />
            </div>
            <h1 className="text-2xl font-noto-serif font-bold text-primary">
              Admin Login
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Sign in to manage the store
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-on-surface-variant mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-error-container/30 text-error text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-4">
          {isSignUp ? (
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className="hover:text-primary transition-colors"
            >
              ← Back to Sign In
            </button>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="hover:text-primary transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </p>

        <p className="text-center text-xs text-on-surface-variant mt-2">
          <a href="/" className="hover:text-primary transition-colors">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  );
}