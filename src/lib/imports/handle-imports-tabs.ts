import { z } from 'zod';

import { DbIdempotencyRepository } from '@/lib/data/idempotency-repository';
import { type ImportResult,store } from '@/lib/data/store';
import { db } from '@/lib/db/client';
import { normalizeUrl } from '@/lib/url/normalize-url';

// Initialize DB idempotency repository if possible
try {
  const idempotencyRepo = new DbIdempotencyRepository(db);
  store.setIdempotencyRepository(idempotencyRepo);
} catch {
  // Fall back to memory idempotency if DB is not available
}

export const ImportsTabsBodySchema = z.object({
  tabs: z
    .array(
      z.object({
        url: z.string().min(1),
        title: z.string().optional(),
      }),
    )
    .min(1),
  target: z
    .object({
      inbox: z.boolean().optional(),
      boardId: z.string().optional(),
      columnId: z.string().optional(),
    })
    .optional(),
  dedupeMode: z.enum(['auto', 'merge', 'forceNew']).default('auto').optional(),
  closeImported: z.boolean().optional(),
});

export type ImportsTabsBody = z.infer<typeof ImportsTabsBodySchema>;

export interface HandleImportsTabsInput {
  readonly ownerId: string;
  readonly idempotencyKey?: string;
  readonly body: ImportsTabsBody;
}

export async function handleImportsTabs(input: HandleImportsTabsInput): Promise<ImportResult> {
  const { idempotencyKey, ownerId, body } = input;

  if (idempotencyKey) {
    const cached = await store.getIdempotentResult(idempotencyKey);
    if (cached) {
      return cached.response;
    }
  }

  const seenNormalized = new Set<string>();
  const created: ImportResult['created'] = [];
  const reused: ImportResult['reused'] = [];
  const ignored: ImportResult['ignored'] = [];

  for (const tab of body.tabs) {
    const normalized = normalizeUrl(tab.url);
    if (seenNormalized.has(normalized)) {
      // Ignore duplicates within the same request payload
      continue;
    }
    seenNormalized.add(normalized);

    if (body.dedupeMode !== 'forceNew') {
      const existing = store.findByOwnerAndUrl(ownerId, normalized);
      if (existing) {
        reused.push(existing);
        continue;
      }
    }

    const createdTab = store.upsertTab(ownerId, normalized, { title: tab.title });
    created.push(createdTab);
  }

  const result: ImportResult = { created, reused, ignored };
  if (idempotencyKey) {
    await store.saveIdempotentResult(idempotencyKey, result);
  }
  return result;
}

// DB-backed async variant used by API routes. Uses dynamic import to avoid
// pulling DB client during unit tests that rely on in-memory store.
export async function handleImportsTabsAsync(
  input: HandleImportsTabsInput,
  repo?: {
    findByOwnerAndUrl(ownerId: string, url: string): Promise<ImportResult['created'][number] | undefined>;
    upsertTab(
      ownerId: string,
      url: string,
      input: { title?: string; color?: string },
    ): Promise<ImportResult['created'][number]>;
  },
): Promise<ImportResult> {
  const { idempotencyKey, ownerId, body } = input;

  if (idempotencyKey) {
    const cached = await store.getIdempotentResult(idempotencyKey);
    if (cached) return cached.response;
  }

  const repository =
    repo ?? (await (async () => {
      const { DbTabsRepository } = await import('@/lib/data/repository');
      const { db } = await import('@/lib/db/client');
      return new DbTabsRepository(db);
    })());

  const seenNormalized = new Set<string>();
  const created: ImportResult['created'] = [];
  const reused: ImportResult['reused'] = [];
  const ignored: ImportResult['ignored'] = [];

  for (const tab of body.tabs) {
    const normalized = normalizeUrl(tab.url);
    if (seenNormalized.has(normalized)) continue;
    seenNormalized.add(normalized);

    if (body.dedupeMode !== 'forceNew') {
      const existing = await repository.findByOwnerAndUrl(ownerId, normalized);
      if (existing) {
        reused.push(existing);
        continue;
      }
    }

    const createdTab = await repository.upsertTab(ownerId, normalized, { title: tab.title });
    created.push(createdTab);
  }

  const result: ImportResult = { created, reused, ignored };
  if (idempotencyKey) store.saveIdempotentResult(idempotencyKey, result);
  return result;
}
