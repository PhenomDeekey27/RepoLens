import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Repository, Issue } from '@/types';

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  let body: { repository?: Repository; issue?: Issue };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { repository, issue } = body;

  if (!repository || !issue) {
    return NextResponse.json(
      { error: 'repository and issue are required' },
      { status: 400 }
    );
  }

  if (!repository.fullName || !repository.owner) {
    return NextResponse.json(
      { error: 'repository.fullName and repository.owner are required' },
      { status: 400 }
    );
  }

  const [owner, repo] = repository.fullName.split('/');

  try {
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        repository_id: repository.id,
        repository_full_name: repository.fullName,
        repository_owner: owner,
        repository_name: repo,
        issue_number: issue.number,
        issue_title: issue.title,
        status: 'queued',
        current_stage: 'issue_context',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[api/analyses] Insert error:', insertError.message);
      return NextResponse.json(
        { error: 'Failed to create analysis: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysisId: analysis.id,
      status: 'queued',
    });
  } catch (error) {
    const err = error as Error;
    console.error('[api/analyses] Unexpected error:', err.message);
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
}
