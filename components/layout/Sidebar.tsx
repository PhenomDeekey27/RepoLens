'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { label: 'Dashboard', href: '/dashboard', icon: '◈' },
  { label: 'New Analysis', href: '/analysis/new', icon: '⊕' },
];

const bottomNavigation = [
  { label: 'GitHub Connected', href: '#', icon: '✓', disabled: true },
  { label: 'Profile', href: '#', icon: '●' },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col w-60 h-full bg-surface-container-low border-r border-outline-variant',
        className
      )}
    >
      <Link href={"/"} className="flex items-center gap-2 px-4 py-4">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary-container">
          <span className="text-sm font-bold text-on-primary-container">R</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-on-surface">RepoLens</span>
          <span className="text-xs text-on-surface-variant">AI Investigation Engine</span>
        </div>
      </Link>

      <div className="px-3 py-2">
        <Link href="/analysis/new" className="w-full">
          <Button
            className="w-full justify-start gap-2 bg-primary-container text-on-primary-container hover:bg-primary-container/90"
          >
            <span className="text-lg">+</span>
            <span>New Analysis</span>
          </Button>
        </Link>
      </div>

      <Separator className="my-2 bg-outline-variant" />

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
                isActive
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="my-2 bg-outline-variant" />

      <div className="px-3 py-2 space-y-1">
        {bottomNavigation.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded text-sm',
              item.disabled
                ? 'text-on-surface-variant cursor-default'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer transition-colors'
            )}
          >
            <span className={cn(
              'text-base',
              item.disabled && 'text-green-500'
            )}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
