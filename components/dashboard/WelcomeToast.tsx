'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function WelcomeToast() {
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome');

  useEffect(() => {
    if (welcome === '1') {
      toast.success('Welcome back! You are now connected to GitHub.');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [welcome]);

  return null;
}
