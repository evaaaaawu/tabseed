"use client";

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Heading, Text } from '@/components/ui/typography';
import { useToast } from '@/components/ui/toast';
import { X } from 'lucide-react';

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
  const { addToast } = useToast();
  const [tokenEditing, setTokenEditing] = useState<string>('');

  // Focus trap and ESC to close for the dialog
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!viewing) return;
    const container = dialogRef.current;
    const previousActive = document.activeElement as HTMLElement | null;
    const getFocusable = (): HTMLElement[] => {
      if (!container) return [];
      const elements = container.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      return Array.from(elements).filter((el) => !el.hasAttribute('disabled'));
    };
    const focusables = getFocusable();
    focusables[0]?.focus();
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setViewing(null);
        return;
      }
      if (e.key === 'Tab') {
        const list = getFocusable();
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousActive?.focus?.();
    };
  }, [viewing]);

  useEffect(() => {
    const t = localStorage.getItem('ts_admin_token');
    setToken(t);
    setTokenEditing(t ?? '');
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
      const msg = await res.text();
      setError(msg);
      addToast({ variant: 'error', title: 'Action failed', description: msg, durationMs: 5000 });
      return;
    }
    setItems((prev) => prev.map((it) => (it.email === email ? { ...it, status } : it)));
    addToast({
      variant: 'success',
      title: status === 'approved' ? 'Approved' : 'Rejected',
      description: email,
      durationMs: 3000,
    });
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
      {/* Token bar */}
      <div className="mb-3 flex items-center gap-2">
        <input
          className="w-full rounded border p-2 text-sm"
          placeholder="Admin token"
          type="password"
          value={tokenEditing}
          onChange={(e) => setTokenEditing(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => {
            localStorage.setItem('ts_admin_token', tokenEditing);
            setToken(tokenEditing);
            addToast({ variant: 'success', title: 'Token updated', durationMs: 2000 });
          }}
        >
          Update
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem('ts_admin_token');
            setToken(null);
            setTokenEditing('');
            addToast({ variant: 'warning', title: 'Token cleared', durationMs: 2000 });
          }}
        >
          Clear
        </Button>
      </div>
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
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="px-3 py-2 font-medium">{it.email}</td>
                <td
                  className="max-w-[24rem] truncate px-3 py-2 text-muted-foreground"
                  title={it.reason ?? ''}
                >
                  {it.reason ?? '—'}
                </td>
                <td className="px-3 py-2">{it.status}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" onClick={() => setViewing(it)}>
                      View
                    </Button>
                    <Button variant="secondary" onClick={() => update(it.email, 'approved')}>
                      Approve
                    </Button>
                    <Button variant="ghost" onClick={() => update(it.email, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      {viewing ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-entry-title"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setViewing(null)}
            aria-hidden
          />
          <Surface className="relative z-10 w-full max-w-lg p-4 shadow-elev-3" ref={dialogRef}>
            <div className="mb-4 flex items-center justify-between">
              <Heading as="h3" id="waitlist-entry-title">Waitlist Entry</Heading>
              <Button variant="ghost" size="icon" aria-label="Close dialog" onClick={() => setViewing(null)}>
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <Text size="xs" muted>
                  Email
                </Text>
                <div className="font-medium">{viewing.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Text size="xs" muted>
                    Status
                  </Text>
                  <div>{viewing.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Text size="xs" muted>
                    Created at
                  </Text>
                  <div>
                    {viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}
                  </div>
                </div>
                <div>
                  <Text size="xs" muted>
                    Updated at
                  </Text>
                  <div>
                    {viewing.updatedAt ? new Date(viewing.updatedAt).toLocaleString() : '—'}
                  </div>
                </div>
              </div>

              <div>
                <Text size="xs" muted>
                  Reason
                </Text>
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
