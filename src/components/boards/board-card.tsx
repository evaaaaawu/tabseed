"use client";

import React from 'react';

import { cn } from '@/lib/utils';

export interface BoardCardProps {
  readonly id: string;
  readonly name?: string;
  readonly color?: string;
  readonly selected?: boolean;
  /** Called when user toggles selection via click/space. */
  readonly onSelect?: (
    id: string,
    modifiers?: { readonly shiftKey?: boolean; readonly metaKey?: boolean; readonly ctrlKey?: boolean; readonly via?: 'click' | 'space' }
  ) => void;
  /** Called on open intent (double click or Enter). */
  readonly onOpen?: (id: string) => void;
  /** Content inside the card (title/actions or editing form). */
  readonly children?: React.ReactNode;
}

export function BoardCard({ id, name, color, selected, onSelect, onOpen, children }: BoardCardProps) {
  return (
    <div
      data-item-id={id}
      role="gridcell"
      aria-selected={onSelect ? (selected ? true : false) : undefined}
      onDoubleClick={() => {
        if (onOpen) onOpen(id);
      }}
      onClick={(e) => {
        if (onSelect) {
          onSelect(id, { shiftKey: e.shiftKey, metaKey: e.metaKey, ctrlKey: e.ctrlKey, via: 'click' });
        }
      }}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === ' ') {
          e.preventDefault();
          onSelect(id, { shiftKey: e.shiftKey, metaKey: e.metaKey, ctrlKey: e.ctrlKey, via: 'space' });
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (onOpen) onOpen(id);
        }
      }}
      className={cn(
        'group block rounded-lg border bg-card p-3 text-card-foreground shadow-elev-1 transition-[transform,box-shadow] duration-200 ease-emphasized hover:-translate-y-0.5 hover:shadow-elev-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2',
        selected && 'ring-2 ring-success',
      )}
      style={color ? ({ borderColor: color } as React.CSSProperties) : undefined}
    >
      {/* Default content when no children supplied */}
      {children ?? (
        <div className="line-clamp-2 text-base font-medium">{name ?? 'Untitled'}</div>
      )}
    </div>
  );
}


