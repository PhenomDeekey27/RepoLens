import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBackgroundClient } from '@/lib/supabase/background';
import { runEvidenceExtraction } from '@/lib/analysis/evidence';

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

  if (analysis.status !== 'root_cause_complete') {
    return NextResponse.json(
      { error: `Analysis must have root cause complete before evidence extraction (current: ${analysis.status})` },
      { status: 409 }
    );
  }

  runEvidenceExtraction(id).catch(async (err) => {
    console.error('[api/evidence] Background extraction failed:', err);
    try {
      const bg = createBackgroundClient();
      await bg.from('analyses').update({
        status: 'failed',
        current_stage: 'evidence_extraction',
        error_message: err instanceof Error ? err.message : 'Evidence extraction failed unexpectedly',
      }).eq('id', id);
      console.error('[api/evidence] Updated analysis to failed status');
    } catch (updateErr) {
      console.error('[api/evidence] Failed to update to failed status:', updateErr);
    }
  });

  return NextResponse.json({ started: true });
}
