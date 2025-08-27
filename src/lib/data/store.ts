import { ulid } from 'ulid';

import type { IdempotencyRepository } from './idempotency-repository';

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
 * Hybrid store that uses DB for idempotency when available, falls back to in-memory.
 */
class HybridStore {
  private readonly tabs: Map<string, TabSeedTab> = new Map();
  private readonly byOwnerAndUrl: Map<string, string> = new Map();
  private readonly memoryIdempotency: Map<string, IdempotencyRecord<ImportResult>> = new Map();
  private dbIdempotencyRepo: IdempotencyRepository | null = null;

  public setIdempotencyRepository(repo: IdempotencyRepository): void {
    this.dbIdempotencyRepo = repo;
  }

  public async getIdempotentResult(key: string): Promise<IdempotencyRecord<ImportResult> | undefined> {
    if (this.dbIdempotencyRepo) {
      try {
        const result = await this.dbIdempotencyRepo.get(key);
        if (result) {
          return {
            key,
            createdAt: new Date().toISOString(), // We don't store this in DB, use current time
            response: result,
          };
        }
      } catch {
        // Fall back to memory if DB fails
      }
    }

    // Fall back to memory
    return this.memoryIdempotency.get(key);
  }

  public async saveIdempotentResult(key: string, result: ImportResult): Promise<IdempotencyRecord<ImportResult>> {
    const record: IdempotencyRecord<ImportResult> = {
      key,
      createdAt: new Date().toISOString(),
      response: result,
    };

    if (this.dbIdempotencyRepo) {
      try {
        await this.dbIdempotencyRepo.save(key, result);
        return record;
      } catch {
        // Fall back to memory if DB fails
      }
    }

    // Fall back to memory
    this.memoryIdempotency.set(key, record);
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

export const store = new HybridStore();
