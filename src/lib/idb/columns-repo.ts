import { getDb } from './db';
import type { KanbanColumnRecord } from './types';

const DEFAULT_COLUMN_NAME = 'No Status';

export async function ensureDefaultColumn(boardId: string): Promise<KanbanColumnRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const defaultId = `${boardId}::col:default`;
  let result: KanbanColumnRecord | null = null;
  await db.transaction('rw', db.columns, async () => {
    const existing = await db.columns.where('boardId').equals(boardId).first();
    if (existing) {
      result = existing;
      return;
    }
    const record: KanbanColumnRecord = {
      id: defaultId,
      boardId,
      name: DEFAULT_COLUMN_NAME,
      sortOrder: 1_000,
      createdAt: now,
      updatedAt: now,
    };
    await db.columns.put(record);
    result = record;
  });
  return result!;
}

export async function listColumns(boardId: string): Promise<readonly KanbanColumnRecord[]> {
  const db = getDb();
  return db.columns.where('boardId').equals(boardId).sortBy('sortOrder');
}

export async function addColumnAtEnd(boardId: string, name: string): Promise<KanbanColumnRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const count = await db.columns.where('boardId').equals(boardId).count();
  if (count >= 50) {
    throw new Error('column_limit_reached');
  }
  const last = await db.columns.where('boardId').equals(boardId).reverse().sortBy('sortOrder');
  const lastOrder = last.length > 0 ? last[0]!.sortOrder : 0;
  const record: KanbanColumnRecord = {
    id: crypto.randomUUID(),
    boardId,
    name: name.trim() || 'Untitled',
    sortOrder: lastOrder + 1_000,
    createdAt: now,
    updatedAt: now,
  };
  await db.columns.put(record);
  return record;
}

export async function renameColumn(columnId: string, name: string): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  await db.columns.update(columnId, {
    name: name.trim() || 'Untitled',
    updatedAt: now,
  } as Partial<KanbanColumnRecord>);
}

/**
 * Reorder columns by applying new index positions. Input is an array of column ids
 * in desired left→right order; function recomputes sortOrder with gaps for future inserts.
 */
export async function reorderColumns(
  boardId: string,
  orderedColumnIds: readonly string[],
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const gap = 1_000;
  await db.transaction('rw', db.columns, async () => {
    for (let i = 0; i < orderedColumnIds.length; i++) {
      const id = orderedColumnIds[i]!;
      const nextOrder = (i + 1) * gap;
      await db.columns.update(id, {
        sortOrder: nextOrder,
        updatedAt: now,
      } as Partial<KanbanColumnRecord>);
    }
  });
}
