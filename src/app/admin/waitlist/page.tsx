"use client";

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type Entry = { id: string; email: string; name?: string | null; status: string };

export default function AdminWaitlistPage() {
	const [token, setToken] = useState<string | null>(null);
	const [items, setItems] = useState<Entry[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const t = localStorage.getItem('ts_admin_token');
		setToken(t);
	}, []);

	useEffect(() => {
		if (!token) return;
		fetch(`/api/admin/waitlist?token=${encodeURIComponent(token)}`)
			.then(async (res) => {
				if (!res.ok) throw new Error(await res.text());
				const json = (await res.json()) as { items: Entry[] };
				setItems(json.items);
			})
			.catch((e) => setError(String(e)));
	}, [token]);

	const update = async (email: string, status: 'approved' | 'rejected') => {
		if (!token) return;
		const res = await fetch(`/api/admin/waitlist?token=${encodeURIComponent(token)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, status }),
		});
		if (!res.ok) {
			setError(await res.text());
			return;
		}
		setItems((prev) => prev.map((it) => (it.email === email ? { ...it, status } : it)));
	};

	if (!token) {
		return (
			<div className="mx-auto max-w-md p-6">
				<h1 className="mb-4 text-2xl font-bold">Admin Token</h1>
				<p className="mb-2 text-sm text-muted-foreground">Set your admin token to continue.</p>
				<input
					className="mb-2 w-full rounded border p-2"
					placeholder="Enter admin token"
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							localStorage.setItem('ts_admin_token', (e.target as HTMLInputElement).value);
							setToken((e.target as HTMLInputElement).value);
						}
					}}
				/>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			<h1 className="mb-4 text-2xl font-bold">Waitlist Admin</h1>
			{error ? <div className="mb-2 text-sm text-destructive">{error}</div> : null}
			<div className="space-y-2">
				{items.map((it) => (
					<div key={it.id} className="flex items-center justify-between rounded border p-3">
						<div>
							<div className="font-medium">{it.email}</div>
							<div className="text-sm text-muted-foreground">{it.name ?? '—'}</div>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm">{it.status}</span>
							<Button variant="secondary" onClick={() => update(it.email, 'approved')}>Approve</Button>
							<Button variant="ghost" onClick={() => update(it.email, 'rejected')}>Reject</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}


