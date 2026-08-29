import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';

export default function GitHubAuthPage() {
  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full glow-primary opacity-10" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full glow-primary opacity-5" />
      </div>
      <Suspense>
        <AuthCard />
      </Suspense>
    </div>
  );
}
