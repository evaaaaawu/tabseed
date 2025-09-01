export interface TabRecord {
  readonly id: string;
  readonly url: string;
  readonly title?: string;
  readonly color?: string;
  readonly etag: string;
  // Future-friendly fields (optional in local cache for now)
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly isDeleted?: boolean;
}

export type TabUpsertInput = ReadonlyArray<
  Pick<TabRecord, 'id' | 'url' | 'etag'> &
    Partial<Pick<TabRecord, 'title' | 'color' | 'createdAt' | 'updatedAt' | 'isDeleted'>>
>;

// --- Kanban boards (local cache) ---
export interface BoardRecord {
  readonly id: string;
  readonly name: string; // default to "Untitled" when created without immediate naming
  readonly color?: string;
  readonly description?: string;
  readonly etag?: string; // optional locally; server will assign upon sync
  readonly createdAt: string; // ISO
  readonly updatedAt: string; // ISO
}
