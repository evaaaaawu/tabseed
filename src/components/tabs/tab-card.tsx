'use client';
import React from 'react';

import { cn } from '@/lib/utils';
import { postUiEvent } from '@/lib/observability/ui';

export interface TabCardProps {
  readonly id: string;
  readonly url: string;
  readonly title?: string;
  readonly color?: string;
  readonly selected?: boolean;
  readonly onSelect?: (
    id: string,
    modifiers?: { readonly shiftKey?: boolean; readonly metaKey?: boolean; readonly ctrlKey?: boolean; readonly via?: 'click' | 'space' }
  ) => void;
  readonly disableClick?: boolean;
}

export function TabCard({ id, url, title, color, selected, onSelect, disableClick }: TabCardProps) {
  return (
    <div
      role="gridcell"
      aria-selected={onSelect ? (selected ? true : false) : undefined}
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
          // Enter 開啟 title 連結（新分頁）
          e.preventDefault();
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
            void postUiEvent('card.open_link', { id, via: 'enter' });
          } catch {}
        }
      }}
      className={cn(
        'group block rounded-lg border bg-card p-3 text-card-foreground shadow-elev-1 transition-[transform,box-shadow] duration-200 ease-emphasized hover:-translate-y-0.5 hover:shadow-elev-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2',
        selected && 'ring-2 ring-success',
      )}
      style={color ? ({ borderColor: color } as React.CSSProperties) : undefined}
    >
      <div className="mb-2 line-clamp-2 break-words text-sm font-medium">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            if (disableClick) {
              e.preventDefault();
              return;
            }
            void postUiEvent('card.open_link', { id, via: 'click' });
          }}
          onMouseDown={(e) => {
            // Prevent drag handlers in parent contexts (e.g., Kanban) from capturing pointer
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          className="underline decoration-transparent transition-colors group-hover:decoration-current"
        >
          {title ?? url}
        </a>
      </div>
      <div className="truncate text-xs text-muted-foreground">{url}</div>
    </div>
  );
}
