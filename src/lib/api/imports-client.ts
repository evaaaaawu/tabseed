"use client";

import type { ImportsTabsBody } from '@/lib/imports/handle-imports-tabs';

const API_VERSION = '2025-08-19';

export type ImportsTabsResponse = {
	created: Array<{ id: string; url: string; title?: string; etag: string }>;
	reused: Array<{ id: string; url: string; title?: string; etag: string }>;
	ignored: Array<{ id: string; url: string; title?: string; etag: string }>;
};

export async function postImportsTabs(
	body: ImportsTabsBody,
	options?: { idempotencyKey?: string },
): Promise<ImportsTabsResponse> {
	const res = await fetch('/api/imports/tabs', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'TS-API-Version': API_VERSION,
			...(options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
		},
		body: JSON.stringify(body),
		cache: 'no-store',
	});

	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`POST /api/imports/tabs failed: ${res.status} ${errText}`);
	}
	return (await res.json()) as ImportsTabsResponse;
}
