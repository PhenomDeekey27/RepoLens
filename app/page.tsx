import { Hero } from '@/components/landing/Hero';
import { ProductPreview } from '@/components/landing/ProductPreview';
import { FeatureSteps } from '@/components/landing/FeatureSteps';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
        <Link href={"/"} className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-primary-container">
            <span className="text-sm font-bold text-on-primary-container">R</span>
          </div>
          <span className="text-sm font-semibold text-on-surface">RepoLens</span>
        </Link >
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Documentation
          </a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Pricing
          </a>
        </nav>
      </header>

      <main>
        <Hero />
        <FeatureSteps />
        <ProductPreview />
      </main>

      <footer className="px-6 py-8 border-t border-outline-variant">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary-container">
              <span className="text-xs font-bold text-on-primary-container">R</span>
            </div>
            <span className="text-xs text-on-surface-variant">
              © 2026 RepoLens. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
