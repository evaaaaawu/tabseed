import { z } from 'zod';
import { normalizeUrl } from '@/lib/url/normalize-url';
import { store, type ImportResult } from '@/lib/data/store';

export const ImportsTabsBodySchema = z.object({
  tabs: z
    .array(
      z.object({
        url: z.string().min(1),
        title: z.string().optional(),
      })
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

export function handleImportsTabs(input: HandleImportsTabsInput): ImportResult {
  const { idempotencyKey, ownerId, body } = input;

  if (idempotencyKey) {
    const cached = store.getIdempotentResult(idempotencyKey);
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
    store.saveIdempotentResult(idempotencyKey, result);
  }
  return result;
}


