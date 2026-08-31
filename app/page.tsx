import { Hero } from '@/components/landing/Hero';
import { ProductPreview } from '@/components/landing/ProductPreview';
import { FeatureSteps } from '@/components/landing/FeatureSteps';
import { HomepageHeader } from '@/components/landing/HomepageHeader';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const githubUser = user?.user_metadata
    ? {
        login: user.user_metadata.user_name || user.user_metadata.login || 'user',
        name: user.user_metadata.full_name || user.user_metadata.name || null,
        avatarUrl: user.user_metadata.avatar_url || '',
      }
    : null;

  return (
    <div className="min-h-screen gradient-surface">
      <HomepageHeader user={githubUser} />

      <main>
        <Hero user={githubUser} />
        <FeatureSteps />
        <ProductPreview />
      </main>

      <footer className="px-6 py-8 border-t border-outline-variant/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">
              © 2026 IssuePilot. All rights reserved.
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
