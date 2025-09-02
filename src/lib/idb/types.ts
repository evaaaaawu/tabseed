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

// --- Kanban columns ---
export interface KanbanColumnRecord {
  readonly id: string;
  readonly boardId: string;
  readonly name: string; // e.g., "No Status" default
  readonly sortOrder: number; // increasing sequence for left→right ordering
  readonly etag?: string;
  readonly createdAt: string; // ISO
  readonly updatedAt: string; // ISO
}

// --- Per-board tab placements (card ordering) ---
export interface TabPlacementRecord {
  readonly id: string;
  readonly tabId: string;
  readonly boardId: string;
  readonly columnId: string;
  readonly orderIndex: number; // sparse index for stable inserts (e.g., 1_000, 2_000, ...)
  readonly etag?: string;
  readonly createdAt: string; // ISO
  readonly updatedAt: string; // ISO
}

// --- Inbox entries (per-tab membership in Inbox) ---
export interface InboxEntryRecord {
  // Use tabId as the primary key to guarantee uniqueness (a tab is in Inbox at most once)
  readonly tabId: string;
  // Support ordering and simple metadata for future features
  readonly orderIndex: number;
  readonly createdAt: string; // ISO
  readonly updatedAt: string; // ISO
}
