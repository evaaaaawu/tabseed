'use client';

import { useMemo, useState } from 'react';

type Modifiers = {
  readonly shiftKey?: boolean;
  readonly metaKey?: boolean;
  readonly ctrlKey?: boolean;
};

export interface UseGridMultiSelectOptions {
  readonly gridCellSelector?: string;
  readonly minDragDistance?: number;
}

export interface UseGridMultiSelectResult {
  readonly selectedIds: ReadonlySet<string>;
  readonly isSelected: (id: string) => boolean;
  readonly handleCardSelect: (id: string, modifiers?: Modifiers) => void;
  readonly clearSelection: () => void;
  readonly containerProps: {
    onPointerDown: React.PointerEventHandler<HTMLDivElement>;
    onPointerMove: React.PointerEventHandler<HTMLDivElement>;
    onPointerUp: React.PointerEventHandler<HTMLDivElement>;
    onPointerCancel: React.PointerEventHandler<HTMLDivElement>;
    onClick: React.MouseEventHandler<HTMLDivElement>;
  };
  readonly dragRect: { left: number; top: number; width: number; height: number } | null;
}

/**
 * Reusable multi-select hook for grid of cards with click/shift/meta and marquee selection.
 */
export function useGridMultiSelect<TItem extends { id: string }>(
  items: ReadonlyArray<TItem>,
  options?: UseGridMultiSelectOptions,
): UseGridMultiSelectResult {
  const gridCellSelector = options?.gridCellSelector ?? '[role="gridcell"]';
  const minDrag = options?.minDragDistance ?? 3;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const idToIndex = useMemo(() => new Map(items.map((t, i) => [t.id, i])), [items]);

  const handleCardSelect = (id: string, modifiers?: Modifiers) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if ((modifiers?.metaKey || modifiers?.ctrlKey) && next.has(id)) {
        next.delete(id);
        return next;
      }
      if (!modifiers?.shiftKey && !modifiers?.metaKey && !modifiers?.ctrlKey && next.has(id)) {
        next.delete(id);
        return next;
      }
      if (modifiers?.shiftKey && next.size > 0) {
        const indices = [...next]
          .map((x) => idToIndex.get(x) ?? -1)
          .filter((i) => i >= 0)
          .sort((a, b) => a - b);
        const anchor = indices.length > 0 ? indices[indices.length - 1] : 0;
        const target = idToIndex.get(id) ?? 0;
        const [start, end] = anchor <= target ? [anchor, target] : [target, anchor];
        for (let i = start; i <= end; i++) next.add(items[i]!.id);
        return next;
      }
      if (modifiers?.metaKey || modifiers?.ctrlKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      next.clear();
      next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType === 'mouse' && e.buttons !== 1) return;
    if (e.shiftKey || e.metaKey || e.ctrlKey) return;
    const isOnCell = (e.target as Element | null)?.closest?.(gridCellSelector);
    if (isOnCell) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setDragRect({ left: x, top: y, width: 0, height: 0 });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    e.preventDefault();
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const left = Math.min(dragStart.x, x);
    const top = Math.min(dragStart.y, y);
    const width = Math.abs(x - dragStart.x);
    const height = Math.abs(y - dragStart.y);
    setDragRect({ left, top, width, height });
    e.preventDefault();
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart) return;
    const container = e.currentTarget as HTMLElement;
    const nodes = Array.from(container.querySelectorAll(gridCellSelector)) as HTMLElement[];
    const cRect = container.getBoundingClientRect();
    const isClick = !!dragRect && dragRect.width < minDrag && dragRect.height < minDrag;
    if (isClick) {
      setSelected(new Set());
    } else {
      const sel = new Set(selected);
      nodes.forEach((node) => {
        const r = node.getBoundingClientRect();
        const nx = r.left - cRect.left;
        const ny = r.top - cRect.top;
        const intersects =
          !!dragRect &&
          !(
            nx > dragRect.left + dragRect.width ||
            nx + r.width < dragRect.left ||
            ny > dragRect.top + dragRect.height ||
            ny + r.height < dragRect.top
          );
        if (intersects) sel.add(node.dataset.itemId!);
      });
      setSelected(sel);
    }
    setDragStart(null);
    setDragRect(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    e.preventDefault();
  };

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragStart(null);
    setDragRect(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const isOnCell = (e.target as Element | null)?.closest?.(gridCellSelector);
    if (!isOnCell) setSelected(new Set());
  };

  return {
    selectedIds: selected,
    isSelected: (id: string) => selected.has(id),
    handleCardSelect: handleCardSelect,
    clearSelection,
    containerProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClick,
    },
    dragRect,
  };
}
