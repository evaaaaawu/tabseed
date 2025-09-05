"use client";

export class HttpError extends Error {
	readonly status: number;
	readonly body: unknown;
	constructor(message: string, status: number, body: unknown) {
		super(message);
		this.name = 'HttpError';
		this.status = status;
		this.body = body;
	}
}

export async function postTestLogin({ code }: { code: string }): Promise<void> {
	const res = await fetch('/api/auth/test-login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ code }),
		cache: 'no-store',
	});
	if (!res.ok) {
		let body: unknown = null;
		const contentType = res.headers.get('Content-Type') || '';
		try {
			body = contentType.includes('application/json') ? await res.json() : await res.text();
		} catch {
			// ignore parse errors
		}
		throw new HttpError('Login failed', res.status, body);
	}
}

export async function getSession(): Promise<{ session: unknown } | null> {
	const res = await fetch('/api/auth/test-login', { cache: 'no-store' });
	if (!res.ok) return null;
	return (await res.json()) as { session: unknown };
}
