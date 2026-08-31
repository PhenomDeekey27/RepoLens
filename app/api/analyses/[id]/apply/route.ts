import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBackgroundClient } from '@/lib/supabase/background';
import { applyPatchToGitHub } from '@/lib/analysis/apply-patch';
import { Patch, ApplyFixError } from '@/types';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: analysis, error: fetchError } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !analysis) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  if (analysis.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (analysis.patch_status === 'applied') {
    return NextResponse.json(
      {
        error: 'Patch has already been applied to this analysis.',
        branch: analysis.created_branch,
        commitSha: analysis.commit_sha,
      },
      { status: 409 }
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const githubToken = session?.provider_token || null;

  if (!githubToken) {
    return NextResponse.json(
      {
        error:
          'GitHub authorization is no longer valid. Please reconnect GitHub.',
        code: 'token_expired',
      },
      { status: 401 }
    );
  }

  const { data: patchArtifact, error: patchError } = await supabase
    .from('analysis_artifacts')
    .select('data')
    .eq('analysis_id', id)
    .eq('artifact_type', 'patch')
    .single();

  if (patchError || !patchArtifact) {
    return NextResponse.json(
      { error: 'No patch found for this analysis.' },
      { status: 404 }
    );
  }

  const patchData = patchArtifact.data as unknown as Patch;

  if (!patchData || !patchData.files || patchData.files.length === 0) {
    return NextResponse.json(
      { error: 'Patch contains no files to apply.' },
      { status: 400 }
    );
  }

  const bg = createBackgroundClient();
  await bg
    .from('analyses')
    .update({ patch_status: 'pending' })
    .eq('id', id);

  const [owner, repo] = analysis.repository_full_name.split('/');

  const result = await applyPatchToGitHub({
    token: githubToken,
    owner,
    repo,
    analysisId: id,
    patch: patchData,
    issueNumber: analysis.issue_number,
  });

  if (!result.success) {
    await bg
      .from('analyses')
      .update({
        patch_status: 'failed',
      })
      .eq('id', id);

    const errorResult = result as ApplyFixError;
    const isPermissionError =
      errorResult.error?.includes('404') || errorResult.error?.includes('403');

    return NextResponse.json(
      {
        ...errorResult,
        code: isPermissionError ? 'insufficient_permissions' : errorResult.code,
      },
      { status: 400 }
    );
  }

  await bg
    .from('analyses')
    .update({
      patch_status: 'applied',
      created_branch: result.branch,
      commit_sha: result.commitSha,
      commit_message: result.commitMessage,
      changed_files: result.filesChanged,
      applied_at: new Date().toISOString(),
      pull_request_url: result.pullRequestUrl || null,
    })
    .eq('id', id);

  return NextResponse.json(result);
}
