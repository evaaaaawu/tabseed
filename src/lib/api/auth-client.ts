"use client";

export async function postTestLogin({ code }: { code: string }): Promise<void> {
	const res = await fetch('/api/auth/test-login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ code }),
		cache: 'no-store',
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Login failed: ${res.status} ${text}`);
	}
}

export async function getSession(): Promise<{ session: unknown } | null> {
	const res = await fetch('/api/auth/test-login', { cache: 'no-store' });
	if (!res.ok) return null;
	return (await res.json()) as { session: unknown };
}
