'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GitHubUser } from '@/types';
import Image from 'next/image';
import { toast } from 'sonner';

interface HomepageHeaderProps {
  user?: GitHubUser | null;
}

export function HomepageHeader({ user }: HomepageHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('analysis-selection');
    setDropdownOpen(false);
    toast.success('Signed out successfully');
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 glass border-b border-outline-variant">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/Logo.png" alt="IssuePilot" width={28} height={28} className="rounded" />
        <span className="text-sm font-semibold text-on-surface">IssuePilot</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-on-surface-variant hidden sm:block">
              @{user.login}
            </span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-container/40 transition-all"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.login}
                    className="w-8 h-8 rounded-full"
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className="text-sm font-medium text-on-surface">
                    {user.login?.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-strong border border-outline-variant rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-sm font-medium text-on-surface">{user.name || user.login}</p>
                    <p className="text-xs font-mono text-on-surface-variant">@{user.login}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setDropdownOpen(false); router.push('/dashboard'); }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); router.push('/analysis/new'); }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
                    >
                      New Analysis
                    </button>
                    <div className="border-t border-outline-variant my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-error-default hover:bg-error-container/20 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link href="/auth/github">
            <button className="gradient-primary text-white px-4 py-2 rounded text-sm font-medium hover:gradient-primary-hover transition-all cursor-pointer">
              Continue with GitHub
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
