import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const message = errorDescription || 'GitHub authorization was cancelled.';
    return NextResponse.redirect(
      new URL(`/auth/github?error=${encodeURIComponent(message)}`, origin)
    );
  }

  if (code) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Exchange error:', exchangeError.message);
      return NextResponse.redirect(
        new URL(
          `/auth/github?error=${encodeURIComponent('We couldn\'t complete your GitHub sign-in. ' + exchangeError.message)}`,
          origin
        )
      );
    }

    const redirectUrl = new URL(next, origin);
    redirectUrl.searchParams.set('welcome', '1');
    const redirectResponse = NextResponse.redirect(redirectUrl);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        maxAge: cookie.maxAge,
        sameSite: cookie.sameSite as 'lax' | 'strict' | 'none',
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
      });
    });

    return redirectResponse;
  }

  return NextResponse.redirect(
    new URL(
      `/auth/github?error=${encodeURIComponent('No authorization code received.')}`,
      origin
    )
  );
}
