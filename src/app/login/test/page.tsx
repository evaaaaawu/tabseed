"use client";

import Link from 'next/link';
import { useState, type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postTestLogin, HttpError } from '@/lib/api/auth-client';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

export default function TestLoginPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Callout tone variants
  type NoticeTone = 'warning' | 'info' | 'destructive';
  const NOTICE_TONE: NoticeTone = 'warning';
  const TONE_STYLES: Record<NoticeTone, string> = {
    warning: 'border-warning/50 bg-warning text-warning-foreground',
    info: 'border-info/50 bg-info text-info-foreground',
    destructive: 'border-destructive/50 bg-destructive text-destructive-foreground',
  } as const;
  const TONE_ICON: Record<NoticeTone, ReactElement> = {
    warning: <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />,
    info: <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />,
    destructive: <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />,
  } as const;

  let debounceTimer: number | undefined;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isLoading) return; // prevent rapid double submit
    setIsLoading(true);
    try {
      if (!code.trim()) {
        setError('Please enter a test code.');
        return;
      }
      await postTestLogin({ code });
      window.location.href = '/inbox';
    } catch (err) {
      const message = getReadableError(err);
      setError(message);
    } finally {
      // small debounce to avoid flicker when responses are very fast
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => setIsLoading(false), 150);
    }
  };

  function getReadableError(err: unknown): string {
    if (err instanceof HttpError) {
      const status = err.status;
      if (status === 400) return 'Invalid or expired test code. Please check and try again.';
      if (status === 401) return 'This code is not authorized yet. Please join the waitlist or contact us.';
      if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
      if (status >= 500) return 'Server error. Please try again later.';
      // Fallback to server-provided message if present
      const body = err.body as any;
      if (body && typeof body === 'object' && typeof body.error?.message === 'string') {
        return body.error.message as string;
      }
      return `Login failed (${status}). Please try again.`;
    }
    return (err as Error).message || 'Unexpected error. Please try again.';
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sign in with a test code</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Early alpha access using a test code.
        </p>
        <div
          role="alert"
          className={cn(
            'mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm shadow-sm text-left',
            TONE_STYLES[NOTICE_TONE],
          )}
        >
          {TONE_ICON[NOTICE_TONE]}
          <p className="text-xs flex-1">
            This test-code page is temporary and may be removed at any time. Do not store important
            data under a test-code account, and remember to back up regularly.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="test-code" className="block text-sm font-medium">
            Test code
          </label>
          <Input
            id="test-code"
            placeholder="Enter test code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            required
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'test-code-error' : 'test-code-hint'}
          />
          <p id="test-code-hint" className="text-xs text-muted-foreground">
            Use the code you received from TabSeed.
          </p>
          <Button className="w-full" type="submit" disabled={isLoading || !code.trim()}>
            {isLoading ? 'Logging in...' : 'Continue'}
          </Button>
          {error ? (
            <div id="test-code-error" role="alert" className="text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </form>

        <div className="mt-5 space-y-2 text-sm text-muted-foreground sm:mt-6">
          <p>
            Want to join the{' '}
            <Link className="text-primary underline hover:text-primary/90" href="/waitlist">
              waitlist
            </Link>
            ? Or go back to the{' '}
            <Link className="text-primary underline hover:text-primary/90" href="/login">
              main login
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
