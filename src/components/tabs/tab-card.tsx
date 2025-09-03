'use client';

import { cn } from '@/lib/utils';

export interface TabCardProps {
  readonly id: string;
  readonly url: string;
  readonly title?: string;
  readonly color?: string;
  readonly selected?: boolean;
  readonly onSelect?: (id: string) => void;
  readonly disableClick?: boolean;
}

export function TabCard({ id, url, title, color, selected, onSelect, disableClick }: TabCardProps) {
  return (
    <div
      onClick={() => {
        if (onSelect) {
          onSelect(id);
        }
      }}
      className={cn(
        'group block rounded-lg border bg-card p-3 text-card-foreground shadow-elev-1 transition-[transform,box-shadow] duration-200 ease-emphasized hover:-translate-y-0.5 hover:shadow-elev-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected && 'ring-2 ring-success',
      )}
      style={color ? ({ borderColor: color } as React.CSSProperties) : undefined}
    >
      <div className="mb-2 line-clamp-2 break-words text-sm font-medium">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            if (disableClick) {
              e.preventDefault();
              return;
            }
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
