"use client";

import { Inbox, Loader2 } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export type ImportTarget = { type: 'inbox' };

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
  const [closeImported, setCloseImported] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm({ type: 'inbox' }, { closeImported });
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
          Import to Inbox
        </Heading>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-md border p-3">
            <Inbox className="mt-0.5 size-5" />
            <div>
              <div className="font-medium">Capture open tabs to Inbox</div>
              <Text size="xs" muted>
                Adds all open tabs (except this page) to your Inbox.
              </Text>
            </div>
          </div>

          <div className="rounded-md border p-3">
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
                'Import'
              )}
            </Button>
          </div>
        </div>
      </Surface>
    </div>
  );
}
