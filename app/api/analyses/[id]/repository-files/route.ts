import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: analysis, error: fetchError } = await supabase
    .from('analyses')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (fetchError || !analysis) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  if (analysis.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: files, error: filesError } = await supabase
    .from('repository_files')
    .select('*')
    .eq('analysis_id', id)
    .order('path');

  if (filesError) {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }

  return NextResponse.json({ files: files || [] });
}
