import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAnalysisInitialization } from '@/lib/analysis/runner';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const { data: analysis, error: fetchError } = await supabase
    .from('analyses')
    .select('id, user_id, status')
    .eq('id', id)
    .single();

  if (fetchError || !analysis) {
    return NextResponse.json(
      { error: 'Analysis not found' },
      { status: 404 }
    );
  }

  if (analysis.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  if (analysis.status !== 'queued') {
    return NextResponse.json(
      { error: 'Analysis already started' },
      { status: 409 }
    );
  }

  const { data: { session } } = await supabase.auth.getSession();
  const githubToken = session?.provider_token || null;

  if (!githubToken) {
    return NextResponse.json(
      { error: 'GitHub token not available. Please re-authenticate with GitHub.' },
      { status: 401 }
    );
  }

  runAnalysisInitialization(id, githubToken).catch((err) => {
    console.error('[api/analyses/run] Background analysis failed:', err);
  });

  return NextResponse.json({ started: true });
}
