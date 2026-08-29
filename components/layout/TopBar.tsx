'use client';

import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GitHubUser } from '@/types';

interface TopBarProps {
  className?: string;
  user?: GitHubUser | null;
}

export function TopBar({ className, user }: TopBarProps) {
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
       

      

        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high overflow-hidden">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.login}
              className="w-8 h-8 rounded-full"
              width={32}
              height={32}
            />
          ) : (
            <span className="text-sm font-medium text-on-surface">
              {user?.login?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
