import { pgTable, text, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core';

export const tabs = pgTable(
  'tabs',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull(),
    url: text('url').notNull(),
    title: text('title'),
    color: text('color'),
    etag: text('etag').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
  },
  (t) => ({
    ownerUrlIdx: uniqueIndex('uniq_owner_url').on(t.ownerId, t.url),
  })
);


