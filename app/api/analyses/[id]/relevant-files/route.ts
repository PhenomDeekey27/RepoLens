import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runRelevantFileDiscovery } from '@/lib/analysis/relevant-files';

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

  if (analysis.status !== 'ready_for_analysis' && analysis.status !== 'failed') {
    return NextResponse.json(
      { error: `Analysis must be ready_for_analysis or failed before relevant file discovery (current: ${analysis.status})` },
      { status: 409 }
    );
  }

  if (analysis.status === 'failed') {
    await supabase.from('analyses').update({
      status: 'queued',
      current_stage: 'issue_context',
      error_message: null,
    }).eq('id', id);
  }

  runRelevantFileDiscovery(id).catch((err) => {
    console.error('[api/relevant-files] Background discovery failed:', err);
    supabase.from('analyses').update({
      status: 'failed',
      current_stage: 'relevant_files_discovery',
      error_message: err instanceof Error ? err.message : 'Discovery failed unexpectedly',
    }).eq('id', id).then(() => {
      console.error('[api/relevant-files] Updated analysis to failed status');
    });
  });

  return NextResponse.json({ started: true });
}
