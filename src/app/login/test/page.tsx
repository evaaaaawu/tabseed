"use client";

import Link from 'next/link';
import { useState } from 'react';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postTestLogin } from '@/lib/api/auth-client';

export default function TestLoginPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (!code.trim()) {
        setError('Please enter a test code.');
        return;
      }
      await postTestLogin({ code });
      window.location.href = '/inbox';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sign in with a test code</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Early alpha access using a test code.
        </p>
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg border border-warning/50 bg-warning p-3 text-sm text-warning-foreground shadow-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="flex-1">
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
