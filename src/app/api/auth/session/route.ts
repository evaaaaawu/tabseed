import { getSessionOrNull } from '@/lib/session';

export async function GET() {
  const session = await getSessionOrNull();
  return new Response(
    JSON.stringify({ session }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
