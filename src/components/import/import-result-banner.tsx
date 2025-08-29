"use client";

import { useMemo, useState } from 'react';

type Item = { readonly id: string; readonly url: string; readonly title?: string };

interface ImportResultBannerProps {
  readonly created: readonly Item[];
  readonly reused: readonly Item[];
  readonly ignored: readonly Item[];
}

export function ImportResultBanner({ created, reused, ignored }: ImportResultBannerProps) {
  const [open, setOpen] = useState(true);
  const createdCount = created.length;
  const reusedCount = reused.length;
  const ignoredCount = ignored.length;

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (createdCount) parts.push(`${createdCount} new`);
    if (reusedCount) parts.push(`${reusedCount} existing`);
    if (ignoredCount) parts.push(`${ignoredCount} ignored`);
    return parts.join(', ');
  }, [createdCount, reusedCount, ignoredCount]);

  if (!open) return null;

  return (
    <div className="mb-4 rounded-md border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">Import result</div>
          <div className="mt-1 text-xs text-muted-foreground">{summary || 'No changes'}</div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border px-2 py-1 text-xs" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Section title={`New (${createdCount})`} items={created} emptyText="No new items" />
        <Section
          title={`Existing (${reusedCount})`}
          items={reused}
          emptyText="No existing duplicates"
        />
        <Section
          title={`Ignored (${ignoredCount})`}
          items={ignored}
          emptyText="No ignored duplicates"
        />
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  emptyText,
}: {
  readonly title: string;
  readonly items: readonly Item[];
  readonly emptyText: string;
}) {
  return (
    <div className="rounded-md border p-2">
      <div className="mb-1 text-xs font-medium">{title}</div>
      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground">{emptyText}</div>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((t) => (
            <li key={t.id} className="truncate text-xs">
              <a href={t.url} target="_blank" rel="noreferrer" className="underline">
                {t.title ?? t.url}
              </a>
            </li>
          ))}
          {items.length > 5 ? (
            <li className="text-[11px] text-muted-foreground">and {items.length - 5} more…</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
