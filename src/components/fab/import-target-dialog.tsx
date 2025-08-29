"use client";

import { ChevronDown, Inbox, Layout, Loader2 } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export type ImportTarget =
  | { type: 'inbox' }
  | { type: 'kanban'; boardId?: string };

interface ImportTargetDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: (
    target: ImportTarget,
    options: { closeImported: boolean },
  ) => Promise<void> | void;
  readonly onSwitchToManual?: () => void;
}

export function ImportTargetDialog({
  open,
  onOpenChange,
  onConfirm,
  onSwitchToManual,
}: ImportTargetDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [target, setTarget] = useState<ImportTarget>({ type: 'inbox' });
  const [closeImported, setCloseImported] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm(target, { closeImported });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} aria-hidden />
      <Surface className="relative z-10 w-full max-w-md p-4 shadow-elev-3">
        <Heading as="h3" className="mb-3">
          Import Target
        </Heading>
        <div className="space-y-2">
          <button
            className={cn(
              'flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              target.type === 'inbox' && 'border-primary bg-primary/5',
            )}
            onClick={() => setTarget({ type: 'inbox' })}
          >
            <Inbox className="size-5" />
            <div>
              <div className="font-medium">Inbox</div>
              <Text size="xs" muted>
                Import to inbox
              </Text>
            </div>
          </button>

          <button
            className={cn(
              'flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              target.type === 'kanban' && 'border-primary bg-primary/5',
            )}
            onClick={() => setTarget({ type: 'kanban' })}
          >
            <span className="inline-flex items-center gap-3">
              <Layout className="size-5" />
              <span>
                <div className="font-medium">Kanban</div>
                <Text size="xs" muted>
                  Import to specific board
                </Text>
              </span>
            </span>
            <ChevronDown className="size-4 opacity-60" />
          </button>

          {target.type === 'kanban' ? (
            <div className="rounded-md border p-3">
              <label className="mb-1 block text-xs text-muted-foreground">Select board (MVP uses mock data)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'board-1', name: 'Product' },
                  { id: 'board-2', name: 'Research' },
                  { id: 'board-3', name: 'Personal' },
                ].map((b) => (
                  <button
                    key={b.id}
                    className={cn(
                      'rounded-md border p-2 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      target.type === 'kanban' &&
                        target.boardId === b.id &&
                        'border-primary bg-primary/5',
                    )}
                    onClick={() => setTarget({ type: 'kanban', boardId: b.id })}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-2 rounded-md border p-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={closeImported}
                onChange={(e) => setCloseImported(e.target.checked)}
              />
              Close imported tabs after import
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {onSwitchToManual ? (
            <button
              onClick={() => {
                onOpenChange(false);
                onSwitchToManual();
              }}
              className="text-sm text-muted-foreground underline hover:text-foreground"
              disabled={isLoading}
            >
              Want to use manual import?
            </button>
          ) : null}

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <Fragment>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Importing
                </Fragment>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>
      </Surface>
    </div>
  );
}
