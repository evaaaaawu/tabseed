"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastOptions {
  readonly title?: string;
  readonly description?: string;
  readonly variant?: ToastVariant;
  readonly durationMs?: number; // If undefined, persists until closed
  readonly linkHref?: string;
  readonly linkLabel?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export interface Toast extends Required<Omit<ToastOptions, 'durationMs' | 'linkHref' | 'linkLabel' | 'onAction' | 'actionLabel'>> {
  readonly id: string;
  readonly durationMs?: number;
  readonly linkHref?: string;
  readonly linkLabel?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

interface ToastContextValue {
  addToast: (opts: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timers.current.get(id);
    if (handle) window.clearTimeout(handle);
    timers.current.delete(id);
  }, []);

  const addToast = useCallback(
    (opts: ToastOptions) => {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        title: opts.title ?? '',
        description: opts.description ?? '',
        variant: opts.variant ?? 'default',
        durationMs: opts.durationMs,
        linkHref: opts.linkHref,
        linkLabel: opts.linkLabel,
        actionLabel: opts.actionLabel,
        onAction: opts.onAction,
      };
      setToasts((prev) => [...prev, toast]);
      if (typeof toast.durationMs === 'number' && toast.durationMs > 0) {
        const h = window.setTimeout(() => removeToast(id), toast.durationMs);
        timers.current.set(id, h);
      }
    },
    [removeToast],
  );

  const value = useMemo<ToastContextValue>(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function variantClasses(variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return 'border-success/40 bg-success/10 text-success';
    case 'error':
      return 'border-destructive/40 bg-destructive/10 text-destructive';
    case 'warning':
      return 'border-warning/40 bg-warning/10 text-warning';
    default:
      return 'border-border bg-card text-card-foreground';
  }
}

function Toaster({ toasts, onClose }: { readonly toasts: readonly Toast[]; readonly onClose: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-full max-w-2xl -translate-x-1/2 flex-col items-center gap-2 px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-lg rounded-md border p-3 shadow-elev-2 ${variantClasses(t.variant)}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {t.title ? <div className="truncate text-sm font-medium">{t.title}</div> : null}
              {t.description ? (
                <div className="mt-0.5 truncate text-xs opacity-80">{t.description}</div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              {t.linkHref ? (
                <a
                  href={t.linkHref}
                  className="whitespace-nowrap rounded-md border px-2 py-1 text-xs text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t.linkLabel ?? 'View'}
                </a>
              ) : null}
              {t.actionLabel ? (
                <button
                  className="whitespace-nowrap rounded-md border px-2 py-1 text-xs text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => t.onAction?.()}
                >
                  {t.actionLabel}
                </button>
              ) : null}
              <button
                className="whitespace-nowrap rounded-md border px-2 py-1 text-xs text-foreground/80 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => onClose(t.id)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
