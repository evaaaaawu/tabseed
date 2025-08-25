import { store, type ImportResult } from '@/lib/data/store';
import { normalizeUrl } from '@/lib/url/normalize-url';
import { z } from 'zod';
import type { TabsRepository } from '@/lib/data/repository';
import { DbTabsRepository } from '@/lib/data/repository';
import { db } from '@/lib/db/client';

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

export async function handleImportsTabsAsync(
  input: HandleImportsTabsInput,
  repo?: TabsRepository
): Promise<ImportResult> {
  const { idempotencyKey, ownerId, body } = input;

  if (idempotencyKey) {
    const cached = store.getIdempotentResult(idempotencyKey);
    if (cached) {
      return cached.response;
    }
  }

  const repository: TabsRepository = repo ?? new DbTabsRepository(db);
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
  if (idempotencyKey) {
    store.saveIdempotentResult(idempotencyKey, result);
  }
  return result;
}
