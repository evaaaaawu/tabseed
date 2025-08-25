import type { DbClient } from '@/lib/db/client';
import { schema } from '@/lib/db/client';
import { eq } from 'drizzle-orm';
import { ulid } from 'ulid';
import type { TabSeedTab } from './store';

export interface TabsRepository {
  findByOwnerAndUrl(ownerId: string, normalizedUrl: string): Promise<TabSeedTab | undefined>;
  upsertTab(
    ownerId: string,
    normalizedUrl: string,
    input: { title?: string; color?: string }
  ): Promise<TabSeedTab>;
}

export class DbTabsRepository implements TabsRepository {
  public constructor(private readonly db: DbClient) {}

  public async findByOwnerAndUrl(ownerId: string, normalizedUrl: string): Promise<TabSeedTab | undefined> {
    const row = await this.db.query.tabs.findFirst({
      where: (t, { and, eq }) => and(eq(t.ownerId, ownerId), eq(t.url, normalizedUrl)),
    });
    if (!row) return undefined;
    return {
      id: row.id,
      ownerId: row.ownerId,
      url: row.url,
      title: row.title ?? undefined,
      color: row.color ?? undefined,
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
      updatedAt: row.updatedAt?.toISOString() ?? new Date().toISOString(),
      etag: row.etag,
      isDeleted: row.isDeleted,
    } satisfies TabSeedTab;
  }

  public async upsertTab(
    ownerId: string,
    normalizedUrl: string,
    input: { title?: string; color?: string }
  ): Promise<TabSeedTab> {
    const existing = await this.findByOwnerAndUrl(ownerId, normalizedUrl);
    const now = new Date();
    if (existing) {
      const newTitle = input.title ?? existing.title;
      const newColor = input.color ?? existing.color;
      const newEtag = `W/"${ulid()}"`;
      await this.db
        .update(schema.tabs)
        .set({ title: newTitle, color: newColor, updatedAt: now, etag: newEtag })
        .where(eq(schema.tabs.id, existing.id));
      return { ...existing, title: newTitle, color: newColor, etag: newEtag, updatedAt: now.toISOString() };
    }
    const id = ulid();
    const etag = `W/"${ulid()}"`;
    await this.db.insert(schema.tabs).values({
      id,
      ownerId,
      url: normalizedUrl,
      title: input.title,
      color: input.color,
      etag,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });
    return {
      id,
      ownerId,
      url: normalizedUrl,
      title: input.title,
      color: input.color,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      etag,
      isDeleted: false,
    } satisfies TabSeedTab;
  }
}
