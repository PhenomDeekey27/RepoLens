'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const permissions = [
  'Read repositories',
  'Read issues',
  'Read repository files',
];

export function AuthCard() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGitHubLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-lg border border-outline-variant bg-surface-container p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container mb-4">
            <span className="text-lg font-bold text-on-primary-container">R</span>
          </div>
          <h1 className="text-xl font-semibold text-on-surface mb-2">RepoLens</h1>
          <p className="text-sm text-on-surface-variant text-center">
            Connect your GitHub account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded border border-error-default/30 bg-error-container/10">
            <p className="text-sm text-error-default text-center">{error}</p>
          </div>
        )}

        <p className="text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
          RepoLens needs GitHub access to inspect repositories and issues. We only request read permissions.
        </p>

        <div className="mb-6 p-4 rounded border border-outline-variant bg-surface-container-low">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
            Requested Permissions
          </p>
          <ul className="space-y-2">
            {permissions.map((permission) => (
              <li key={permission} className="flex items-center gap-2 text-sm text-on-surface">
                <span className="text-green-500">✓</span>
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90 h-11"
          onClick={handleGitHubLogin}
          disabled={loading}
        >
          {loading ? 'Connecting to GitHub...' : 'Continue with GitHub'}
        </Button>

        <p className="text-xs text-on-surface-variant text-center mt-4">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary-container hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-container hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
