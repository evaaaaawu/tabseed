"use client";

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type Entry = {
	id: string;
	email: string;
	name?: string | null;
	reason?: string | null;
	status: string;
	createdAt?: string;
};

export default function AdminWaitlistPage() {
	const [token, setToken] = useState<string | null>(null);
	const [items, setItems] = useState<Entry[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [sortBy, setSortBy] = useState<'createdAt' | 'email' | 'status'>('createdAt');
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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

	const filtered = items
		.filter((it) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (
				it.email.toLowerCase().includes(q) ||
				(it.name ?? '').toLowerCase().includes(q) ||
				(it.reason ?? '').toLowerCase().includes(q) ||
				it.status.toLowerCase().includes(q)
			);
		})
		.sort((a, b) => {
			const dir = sortDir === 'asc' ? 1 : -1;
			if (sortBy === 'email') return a.email.localeCompare(b.email) * dir;
			if (sortBy === 'status') return a.status.localeCompare(b.status) * dir;
			const atA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const atB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return (atA - atB) * dir;
		});

	return (
		<div className="mx-auto max-w-2xl p-6">
			<h1 className="mb-4 text-2xl font-bold">Waitlist Admin</h1>
			{error ? <div className="mb-2 text-sm text-destructive">{error}</div> : null}
			<div className="mb-3 flex items-center gap-2">
				<input
					className="w-full rounded border p-2 text-sm"
					placeholder="Search by email, name, reason, status"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<select
					className="rounded border p-2 text-sm"
					value={`${sortBy}:${sortDir}`}
					onChange={(e) => {
						const [by, dir] = e.target.value.split(':') as [typeof sortBy, typeof sortDir];
						setSortBy(by);
						setSortDir(dir);
					}}
				>
					<option value="createdAt:desc">Newest</option>
					<option value="createdAt:asc">Oldest</option>
					<option value="email:asc">Email A→Z</option>
					<option value="email:desc">Email Z→A</option>
					<option value="status:asc">Status A→Z</option>
					<option value="status:desc">Status Z→A</option>
				</select>
			</div>
			<div className="overflow-hidden rounded-xl border">
				<table className="w-full text-left text-sm">
					<thead className="bg-muted/40">
						<tr>
							<th className="px-3 py-2">Email</th>
							<th className="px-3 py-2">Name</th>
							<th className="px-3 py-2">Reason</th>
							<th className="px-3 py-2">Status</th>
							<th className="px-3 py-2 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((it) => (
							<tr key={it.id} className="border-t">
								<td className="px-3 py-2 font-medium">{it.email}</td>
								<td className="px-3 py-2 text-muted-foreground">{it.name ?? '—'}</td>
								<td className="max-w-[24rem] truncate px-3 py-2 text-muted-foreground" title={it.reason ?? ''}>
									{it.reason ?? '—'}
								</td>
								<td className="px-3 py-2">{it.status}</td>
								<td className="px-3 py-2">
									<div className="flex items-center justify-end gap-2">
										<Button variant="secondary" onClick={() => update(it.email, 'approved')}>Approve</Button>
										<Button variant="ghost" onClick={() => update(it.email, 'rejected')}>Reject</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
