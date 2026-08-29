import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';

export default function GitHubAuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Suspense>
        <AuthCard />
      </Suspense>
    </div>
  );
}
