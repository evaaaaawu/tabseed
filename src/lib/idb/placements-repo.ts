import { getDb } from './db';
import type { TabPlacementRecord } from './types';

export async function listPlacements(
  boardId: string,
  columnId?: string,
): Promise<readonly TabPlacementRecord[]> {
  const db = getDb();
  if (columnId) {
    return db.placements.where({ boardId, columnId }).sortBy('orderIndex');
  }
  return db.placements.where('boardId').equals(boardId).sortBy('orderIndex');
}

export async function addPlacementAtEnd(input: {
  tabId: string;
  boardId: string;
  columnId: string;
}): Promise<TabPlacementRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const rows = await db.placements
    .where({ boardId: input.boardId, columnId: input.columnId })
    .reverse()
    .sortBy('orderIndex');
  const lastOrder = rows.length > 0 ? rows[0]!.orderIndex : 0;
  const record: TabPlacementRecord = {
    id: crypto.randomUUID(),
    tabId: input.tabId,
    boardId: input.boardId,
    columnId: input.columnId,
    orderIndex: lastOrder + 1_000,
    createdAt: now,
    updatedAt: now,
  };
  await db.placements.put(record);
  return record;
}

export async function movePlacement(
  placementId: string,
  input: { toColumnId: string; beforeId?: string; afterId?: string },
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  // Compute new orderIndex by neighbor median; fallback to append.
  let nextIndex: number | undefined;
  if (input.beforeId || input.afterId) {
    let beforeIndex: number | undefined;
    let afterIndex: number | undefined;
    if (input.beforeId) {
      const before = await db.placements.get(input.beforeId);
      beforeIndex = before?.orderIndex;
    }
    if (input.afterId) {
      const after = await db.placements.get(input.afterId);
      afterIndex = after?.orderIndex;
    }
    if (beforeIndex !== undefined && afterIndex !== undefined) {
      nextIndex = (beforeIndex + afterIndex) / 2;
    } else if (beforeIndex !== undefined) {
      nextIndex = beforeIndex - 0.5;
    } else if (afterIndex !== undefined) {
      nextIndex = afterIndex + 0.5;
    }
  }
  if (nextIndex === undefined) {
    const rows = await db.placements
      .where({ columnId: input.toColumnId })
      .reverse()
      .sortBy('orderIndex');
    nextIndex = rows.length > 0 ? rows[0]!.orderIndex + 1_000 : 1_000;
  }

  await db.placements.update(placementId, {
    columnId: input.toColumnId,
    orderIndex: nextIndex,
    updatedAt: now,
  } as Partial<TabPlacementRecord>);
}

/**
 * Ensure placements exist for given tab ids in a column. Skips existing (boardId+tabId) pairs.
 * Appends new ones at end with sparse orderIndex.
 */
export async function ensurePlacementsAtEnd(
  input: { boardId: string; columnId: string; tabIds: readonly string[] },
): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();
  let created = 0;
  await db.transaction('rw', db.placements, async () => {
    // Determine start index
    const rows = await db.placements
      .where({ boardId: input.boardId, columnId: input.columnId })
      .reverse()
      .sortBy('orderIndex');
    let lastOrder = rows.length > 0 ? rows[0]!.orderIndex : 0;
    for (const tabId of input.tabIds) {
      const exists = await db.placements
        .where('boardId')
        .equals(input.boardId)
        .and((p) => p.tabId === tabId)
        .first();
      if (exists) continue;
      lastOrder += 1_000;
      const rec: TabPlacementRecord = {
        id: crypto.randomUUID(),
        tabId,
        boardId: input.boardId,
        columnId: input.columnId,
        orderIndex: lastOrder,
        createdAt: now,
        updatedAt: now,
      };
      await db.placements.put(rec);
      created += 1;
    }
  });
  return created;
}
