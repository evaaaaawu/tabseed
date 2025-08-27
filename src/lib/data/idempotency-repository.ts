import { eq, lt } from 'drizzle-orm';
import { ulid } from 'ulid';

import type { DbClient } from '@/lib/db/client';
import { schema } from '@/lib/db/client';

import type { ImportResult } from './store';

export interface IdempotencyRepository {
  get(key: string): Promise<ImportResult | null>;
  save(key: string, result: ImportResult): Promise<void>;
  cleanupExpired(): Promise<void>; // For background cleanup
}

export class DbIdempotencyRepository implements IdempotencyRepository {
  constructor(private readonly db: DbClient) {}

  async get(key: string): Promise<ImportResult | null> {
    const now = new Date();
    const record = await this.db.query.idempotencyRecords.findFirst({
      where: eq(schema.idempotencyRecords.key, key),
    });

    if (!record) return null;

    // Check if expired
    if (record.expiresAt <= now) {
      // Clean up expired record
      await this.db.delete(schema.idempotencyRecords).where(eq(schema.idempotencyRecords.id, record.id));
      return null;
    }

    try {
      return JSON.parse(record.response) as ImportResult;
    } catch {
      // If response is corrupted, clean it up
      await this.db.delete(schema.idempotencyRecords).where(eq(schema.idempotencyRecords.id, record.id));
      return null;
    }
  }

  async save(key: string, result: ImportResult): Promise<void> {
    const id = ulid();
    const now = new Date();
    // Set TTL to 24 hours
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await this.db.insert(schema.idempotencyRecords).values({
      id,
      key,
      response: JSON.stringify(result),
      createdAt: now,
      expiresAt,
    });
  }

  async cleanupExpired(): Promise<void> {
    const now = new Date();
    await this.db.delete(schema.idempotencyRecords).where(lt(schema.idempotencyRecords.expiresAt, now));
  }
}
