import { getDb } from './db';
import type { BoardRecord } from './types';

export async function createBoardDraft(initial?: Partial<Pick<BoardRecord, 'name' | 'color' | 'description'>>): Promise<BoardRecord> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const record: BoardRecord = {
    id,
    name: initial?.name?.trim() ? initial!.name! : 'Untitled',
    color: initial?.color,
    description: initial?.description,
    createdAt: now,
    updatedAt: now,
  };
  await db.boards.put(record);
  return record;
}

export async function renameBoard(boardId: string, name: string): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const nextName = name.trim() ? name.trim() : 'Untitled';
  await db.boards.update(boardId, { name: nextName, updatedAt: now } as Partial<BoardRecord>);
}

export async function listBoardsNewest(): Promise<readonly BoardRecord[]> {
  const db = getDb();
  // createdAt newest first
  return db.boards.orderBy('createdAt').reverse().toArray();
}

export async function countBoards(): Promise<number> {
  const db = getDb();
  return db.boards.count();
}
