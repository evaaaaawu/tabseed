import { NextRequest } from 'next/server';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_SCOPE = 'openid email profile';

export async function GET(_req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectBase = process.env.OAUTH_REDIRECT_BASE_URL;
  if (!clientId || !redirectBase) {
    return new Response('Google OAuth is not configured', { status: 500 });
  }
  const redirectUri = `${redirectBase}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    include_granted_scopes: 'true',
    access_type: 'offline',
    prompt: 'consent',
  });
  return Response.redirect(`${GOOGLE_AUTH_BASE}?${params.toString()}`);
}


