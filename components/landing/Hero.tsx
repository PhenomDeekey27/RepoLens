'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GitHubUser } from '@/types';

interface HeroProps {
  user?: GitHubUser | null;
}

export function Hero({ user }: HeroProps) {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full glow-primary opacity-30" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-outline-variant/50 glass">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
            ENGINE V2.0 ACTIVE
          </span>
        </div>

        <h1 className="max-w-3xl text-4xl md:text-5xl font-bold text-on-surface leading-tight tracking-tight mb-6">
          Understand any
          <br />
          <span className="text-primary-container">GitHub issue</span> faster.
        </h1>

        <p className="max-w-xl text-lg text-on-surface-variant mb-8 leading-relaxed">
          Connect a repository, select an issue, and let IssuePilot trace the relevant code, identify the root cause, and generate an actionable patch.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="gradient-primary text-white px-6 h-11 font-medium hover:gradient-primary-hover transition-all cursor-pointer"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/github">
              <Button
                size="lg"
                className=" cursor-pointer gradient-primary text-white px-6 h-11 font-medium hover:gradient-primary-hover transition-all"
              >
                Continue with GitHub
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="lg"
            className="border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container h-11 cursor-pointer"
            onClick={scrollToHowItWorks}
          >
            See how it works
          </Button>
        </div>
      </div>
    </section>
  );
}
