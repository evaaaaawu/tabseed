import Dexie, { type Table } from 'dexie';

import type { TabRecord } from './types';

export class TabSeedIDB extends Dexie {
  public tabs!: Table<TabRecord, string>;
  public boards!: Table<import('./types').BoardRecord, string>;
  public columns!: Table<import('./types').KanbanColumnRecord, string>;
  public placements!: Table<import('./types').TabPlacementRecord, string>;
  public inbox!: Table<import('./types').InboxEntryRecord, string>;

  constructor() {
    super('tabseed');
    this.version(1).stores({
      // by id (primary key), and an index on url for quick lookup/dedupe
      tabs: '&id, url',
    });
    // v2: add boards store
    this.version(2).stores({
      boards: '&id, createdAt',
    });
    // v3: add kanban columns and placements
    this.version(3).stores({
      columns: '&id, boardId, sortOrder',
      placements: '&id, boardId, columnId, orderIndex',
    });
    // v4: add inbox store (primary key = tabId for uniqueness)
    this.version(4).stores({
      inbox: '&tabId, orderIndex',
    });
  }
}

let dbSingleton: TabSeedIDB | null = null;

export function getDb(): TabSeedIDB {
  if (dbSingleton) return dbSingleton;
  dbSingleton = new TabSeedIDB();
  return dbSingleton;
}

export async function resetDb(): Promise<void> {
  if (dbSingleton) {
    // delete() also closes connections
    await dbSingleton.delete();
    try {
      dbSingleton.close();
    } catch {}
    dbSingleton = null;
  }
}
