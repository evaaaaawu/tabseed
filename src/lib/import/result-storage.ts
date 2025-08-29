"use client";

export type ImportResultPayload = {
  readonly created: Array<{ id: string; url: string; title?: string }>;
  readonly reused: Array<{ id: string; url: string; title?: string }>;
  readonly ignored: Array<{ id: string; url: string; title?: string }>;
  readonly savedAt: number;
};

const KEY = 'tabseed:lastImportResult';

export function saveLastImportResult(payload: Omit<ImportResultPayload, 'savedAt'>): void {
  try {
    const value: ImportResultPayload = { ...payload, savedAt: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {}
}

export function readLastImportResult(): ImportResultPayload | null {
  try {
    const txt = sessionStorage.getItem(KEY);
    if (!txt) return null;
    return JSON.parse(txt) as ImportResultPayload;
  } catch {
    return null;
  }
}
