"use client";

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Heading, Text } from '@/components/ui/typography';

type Entry = {
	id: string;
	email: string;
	name?: string | null;
	reason?: string | null;
	status: string;
	createdAt?: string;
	updatedAt?: string;
};

export default function AdminWaitlistPage() {
	const [token, setToken] = useState<string | null>(null);
	const [items, setItems] = useState<Entry[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [sortBy, setSortBy] = useState<'createdAt' | 'email' | 'status'>('createdAt');
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
	const [viewing, setViewing] = useState<Entry | null>(null);

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
				<p className="mb-2 text-sm text-muted-foreground">Please enter admin token to continue.</p>
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
										<Button variant="ghost" onClick={() => setViewing(it)}>View</Button>
										<Button variant="secondary" onClick={() => update(it.email, 'approved')}>Approve</Button>
										<Button variant="ghost" onClick={() => update(it.email, 'rejected')}>Reject</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Detail Dialog */}
			{viewing ? (
				<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
					<div className="absolute inset-0 bg-black/40" onClick={() => setViewing(null)} aria-hidden />
					<Surface className="relative z-10 w-full max-w-lg p-4 shadow-elev-3">
						<div className="mb-4 flex items-center justify-between">
							<Heading as="h3">Waitlist Entry</Heading>
							<Button variant="ghost" size="sm" onClick={() => setViewing(null)}>Close</Button>
						</div>

						<div className="space-y-3 text-sm">
							<div>
								<Text size="xs" muted>Email</Text>
								<div className="font-medium">{viewing.email}</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<Text size="xs" muted>Status</Text>
									<div>{viewing.status}</div>
								</div>
								<div>
									<Text size="xs" muted>Name</Text>
									<div className="text-muted-foreground">{viewing.name ?? '—'}</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<Text size="xs" muted>Created at</Text>
									<div>{viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}</div>
								</div>
								<div>
									<Text size="xs" muted>Updated at</Text>
									<div>{viewing.updatedAt ? new Date(viewing.updatedAt).toLocaleString() : '—'}</div>
								</div>
							</div>

							<div>
								<Text size="xs" muted>Reason</Text>
								<div className="whitespace-pre-wrap rounded-md border bg-muted/20 p-3 text-muted-foreground">
									{viewing.reason || '—'}
								</div>
							</div>
						</div>
					</Surface>
				</div>
			) : null}
		</div>
	);
}
