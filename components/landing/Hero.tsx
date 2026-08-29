import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded border border-outline-variant bg-surface-container">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          ENGINE V2.0 ACTIVE
        </span>
      </div>

      <h1 className="max-w-3xl text-4xl md:text-5xl font-semibold text-on-surface leading-tight tracking-tight mb-6">
        Understand any
        <br />
        GitHub issue faster.
      </h1>

      <p className="max-w-xl text-lg text-on-surface-variant mb-8 leading-relaxed">
        Connect a repository, select an issue, and let RepoLens trace the relevant code, identify the root cause, and generate an actionable patch.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/auth/github">
          <Button
            size="lg"
            className="bg-primary-container text-on-primary-container hover:bg-primary-container/90 px-6 h-11"
          >
            Continue with GitHub
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          className="border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container h-11"
        >
          See how it works
        </Button>
      </div>
    </section>
  );
}
