import { NextRequest } from 'next/server';

import { setSession } from '@/lib/session';

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
};

type GoogleIdToken = {
  email?: string;
  name?: string;
  sub?: string; // google user id
  picture?: string;
  email_verified?: boolean;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code', { status: 400 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectBase = process.env.OAUTH_REDIRECT_BASE_URL;
  if (!clientId || !clientSecret || !redirectBase) {
    return new Response('Google OAuth is not configured', { status: 500 });
  }
  const redirectUri = `${redirectBase}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return new Response(`Token exchange failed: ${text}`, { status: 400 });
  }
  const tokenJson = (await tokenRes.json()) as GoogleTokenResponse;

  // Decode id_token (JWT) without verification (Google's JWT is signed; for MVP we trust HTTPS + Google)
  const [, payloadB64] = tokenJson.id_token.split('.', 3);
  const payloadJson = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  const idToken = JSON.parse(payloadJson) as GoogleIdToken;

  const email = idToken.email;
  const name = idToken.name;
  if (!email || idToken.email_verified === false) {
    return new Response('Email not available or not verified', { status: 403 });
  }

  const allowlist = (process.env.ALLOWLIST_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowlist.includes(email.toLowerCase())) {
    // Not approved yet → send to waitlist page (to be implemented)
    return Response.redirect('/waitlist?status=pending');
  }

  await setSession({ userId: `google_${email}`, email, name });
  return Response.redirect('/inbox');
}


