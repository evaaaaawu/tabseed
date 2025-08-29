"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastOptions {
  readonly title?: string;
  readonly description?: string;
  readonly variant?: ToastVariant;
  readonly durationMs?: number;
}

export interface Toast extends Required<ToastOptions> {
  readonly id: string;
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
        durationMs: opts.durationMs ?? 3000,
      };
      setToasts((prev) => [...prev, toast]);
      const h = window.setTimeout(() => removeToast(id), toast.durationMs);
      timers.current.set(id, h);
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
      return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100';
    case 'error':
      return 'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100';
    case 'warning':
      return 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100';
    default:
      return 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100';
  }
}

function Toaster({ toasts, onClose }: { readonly toasts: readonly Toast[]; readonly onClose: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-full max-w-lg -translate-x-1/2 flex-col items-center gap-2 px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-lg rounded-md border p-3 shadow-lg ${variantClasses(t.variant)}`}
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
            <button
              className="rounded-md border px-2 py-1 text-xs opacity-80 hover:opacity-100"
              onClick={() => onClose(t.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
