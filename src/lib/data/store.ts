import { ulid } from 'ulid';

export interface TabSeedTab {
  readonly id: string;
  readonly ownerId: string;
  readonly url: string;
  title?: string;
  color?: string;
  readonly createdAt: string;
  updatedAt: string;
  etag: string;
  isDeleted?: boolean;
}

export interface ImportResult {
  created: TabSeedTab[];
  reused: TabSeedTab[];
  ignored: TabSeedTab[];
}

export interface ImportOptions {
  readonly ownerId: string;
  readonly target?: { inbox?: boolean; boardId?: string; columnId?: string };
  readonly dedupeMode?: 'auto' | 'merge' | 'forceNew';
}

export interface IdempotencyRecord<T> {
  readonly key: string;
  readonly createdAt: string;
  readonly response: T;
}

/**
 * Simple in-memory store for MVP. Replace with Drizzle/Neon later.
 */
class InMemoryStore {
  private readonly tabs: Map<string, TabSeedTab> = new Map();
  private readonly byOwnerAndUrl: Map<string, string> = new Map();
  private readonly idempotency: Map<string, IdempotencyRecord<ImportResult>> = new Map();

  public getIdempotentResult(key: string): IdempotencyRecord<ImportResult> | undefined {
    return this.idempotency.get(key);
  }

  public saveIdempotentResult(key: string, result: ImportResult): IdempotencyRecord<ImportResult> {
    const record: IdempotencyRecord<ImportResult> = {
      key,
      createdAt: new Date().toISOString(),
      response: result,
    };
    this.idempotency.set(key, record);
    return record;
  }

  public findByOwnerAndUrl(ownerId: string, normalizedUrl: string): TabSeedTab | undefined {
    const compositeKey = `${ownerId}::${normalizedUrl}`;
    const id = this.byOwnerAndUrl.get(compositeKey);
    if (!id) return undefined;
    return this.tabs.get(id);
  }

  public upsertTab(ownerId: string, normalizedUrl: string, input: { title?: string; color?: string }): TabSeedTab {
    const now = new Date().toISOString();
    const existing = this.findByOwnerAndUrl(ownerId, normalizedUrl);
    if (existing) {
      existing.title = input.title ?? existing.title;
      existing.color = input.color ?? existing.color;
      existing.updatedAt = now;
      existing.etag = `W/"${ulid()}"`;
      return existing;
    }
    const id = ulid();
    const tab: TabSeedTab = {
      id,
      ownerId,
      url: normalizedUrl,
      title: input.title,
      color: input.color,
      createdAt: now,
      updatedAt: now,
      etag: `W/"${ulid()}"`,
      isDeleted: false,
    };
    this.tabs.set(id, tab);
    const compositeKey = `${ownerId}::${normalizedUrl}`;
    this.byOwnerAndUrl.set(compositeKey, id);
    return tab;
  }
}

export const store = new InMemoryStore();


