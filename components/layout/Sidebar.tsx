'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { GitHubUser } from '@/types';
import { toast } from 'sonner';
import Image from 'next/image';

interface SidebarProps {
  className?: string;
  user?: GitHubUser | null;
}

const navigation = [
  { label: 'Dashboard', href: '/dashboard', icon: '◈' },
  { label: 'New Analysis', href: '/analysis/new', icon: '⊕' },
];

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('analysis-selection');
    toast.success('Signed out successfully');
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <aside
      className={cn(
        'flex flex-col w-60 h-full glass-sidebar border-r border-outline-variant/50',
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2 px-4 py-4 pt-14 md:pt-4">
        <Image src="/Logo.png" alt="IssuePilot" width={32} height={32} className="rounded" />
        <span className="text-sm font-semibold text-on-surface">IssuePilot</span>
      </Link>

      <div className="px-3 py-2">
        <Link href="/analysis/new" className="w-full">
          <Button
            className="w-full justify-start gap-2 gradient-primary text-white hover:gradient-primary-hover font-medium"
          >
            <span className="text-lg leading-none">+</span>
            <span>New Analysis</span>
          </Button>
        </Link>
      </div>

      <Separator className="my-2 bg-outline-variant/50" />

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded text-sm transition-all',
                isActive
                  ? 'bg-surface-container-high text-on-surface border-l-2 border-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="my-2 bg-outline-variant/50" />

      <div className="px-3 py-2 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded text-sm text-on-surface-variant cursor-default">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-mono uppercase tracking-wider">GitHub Connected</span>
        </div>

        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded text-sm text-on-surface">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.login}
                className="w-5 h-5 rounded-full"
                width={20}
                height={20}
              />
            ) : (
              <span className="text-base">●</span>
            )}
            <span className="font-mono text-xs text-on-surface-variant truncate">@{user.login}</span>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded text-sm text-on-surface-variant hover:bg-surface-container hover:text-error-default cursor-pointer transition-colors w-full"
        >
          <span className="text-base">↗</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
