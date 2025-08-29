"use client";

import { useEffect, useState } from 'react';

import { ImportResultBanner } from '@/components/import/import-result-banner';
import { readLastImportResult, type ImportResultPayload } from '@/lib/import/result-storage';

export default function ImportResultPage() {
  const [data, setData] = useState<ImportResultPayload | null>(null);

  useEffect(() => {
    setData(readLastImportResult());
  }, []);

  return (
    <div className="min-h-[60svh] p-6">
      <h1 className="mb-4 text-2xl font-bold">Import Result</h1>
      {data ? (
        <ImportResultBanner created={data.created} reused={data.reused} ignored={data.ignored} />
      ) : (
        <div className="text-sm text-muted-foreground">No import result found.</div>
      )}

      {data ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FullList title={`New (${data.created.length})`} items={data.created} />
          <FullList title={`Existing (${data.reused.length})`} items={data.reused} />
          <FullList title={`Ignored (${data.ignored.length})`} items={data.ignored} />
        </div>
      ) : null}
    </div>
  );
}

function FullList({ title, items }: { readonly title: string; readonly items: ReadonlyArray<{ id: string; url: string; title?: string }> }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{title}</div>
      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground">Empty</div>
      ) : (
        <ul className="space-y-1">
          {items.map((t) => (
            <li key={t.id} className="truncate text-sm">
              <a href={t.url} target="_blank" rel="noreferrer" className="underline">
                {t.title ?? t.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


