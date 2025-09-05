import { boolean, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
  }),
);

export const idempotencyRecords = pgTable(
  'idempotency_records',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    response: text('response').notNull(), // JSON string of ImportResult
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), // TTL for cleanup
  },
);

export const waitlistEntries = pgTable(
  'waitlist_entries',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name'),
    reason: text('reason'),
    status: text('status').notNull().default('pending'), // pending | approved | rejected
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqEmail: uniqueIndex('uniq_waitlist_email').on(t.email),
  }),
);
