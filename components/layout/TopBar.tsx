'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface TopBarProps {
  className?: string;
}

const topBarLinks = [
  { label: 'Docs', href: '#' },
  { label: 'Support', href: '#' },
  { label: 'API', href: '#' },
];

export function TopBar({ className }: TopBarProps) {
  return (
    <header
      className={`flex items-center justify-between h-12 px-4 bg-surface-container-low border-b border-outline-variant ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 bg-surface-container border-outline-variant text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {topBarLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm text-on-surface-variant hover:text-on-surface h-8 flex items-center"
          >
            {link.label}
          </a>
        ))}

        <Separator orientation="vertical" className="h-4 bg-outline-variant" />

        <Button
          variant="outline"
          size="sm"
          className="h-8 border-outline-variant text-on-surface-variant hover:text-on-surface"
        >
          Connect Repo
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-on-surface-variant hover:text-on-surface"
          aria-label="Notifications"
        >
          <span>🔔</span>
        </Button>

        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high">
          <span className="text-sm font-medium text-on-surface">D</span>
        </div>
      </div>
    </header>
  );
}
