'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      const e = q.get('email');
      if (e) setEmail(e);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGmail, setIsGmail] = useState<boolean>(true);
  const [reason, setReason] = useState('');
  const isReasonValid = reason.trim().length >= 5 && reason.trim().length <= 1000;
  const [emailError, setEmailError] = useState<string | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setEmailError(null);
    setReasonError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });
      if (res.ok) {
        setMessage(
          "🥰Thanks for joining! You're on the waitlist—we'll notify you as soon as you're approved.",
        );
        setEmail('');
        setReason('');
      } else if (res.status === 409) {
        const json = await res.json().catch(() => null);
        const requestId = json?.error?.requestId ? ` (req: ${json.error.requestId})` : '';
        if (json?.error?.code === 'already_approved') {
          setError('This email has already been approved. You can now use this email to log in to TabSeed.');
          setMessage(
            <span>
              Approved: Please go to <a className="text-primary underline" href="/login">/login</a> and use Google login.
            </span> as unknown as string,
          );
        } else if (json?.error?.code === 'conflict') {
          setError('This email is already on the waitlist.');
        } else {
          setError('You\'re already on the waitlist.');
        }
      } else {
        const text = await res.text();
        let msg = `Submit failed: ${res.status} ${text}`;
        try {
          const json = JSON.parse(text) as unknown as {
            error?: { code?: string; message?: string; requestId?: string; details?: any };
          };
          if (json?.error?.code === 'validation_failed' && json.error.details) {
            const fieldErrors = json.error.details.fieldErrors ?? {};
            const emailErrArr = fieldErrors.email as string[] | undefined;
            const reasonErrArr = fieldErrors.reason as string[] | undefined;
            if (emailErrArr?.length) setEmailError(emailErrArr[0]);
            if (reasonErrArr?.length) setReasonError(reasonErrArr[0]);
          }
          if (json?.error?.message) {
            msg = `${json.error.message}${json.error.requestId ? ` (req: ${json.error.requestId})` : ''}`;
          }
        } catch {}
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Join the TabSeed waitlist</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Get notified when you are approved.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="waitlist-email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="waitlist-email"
            type="email"
            placeholder="your.name@gmail.com"
            value={email}
            onChange={(e) => {
              const next = e.target.value;
              setEmail(next);
              // Gmail-only validation (case-insensitive, trims spaces)
              const normalized = next.trim().toLowerCase();
              setIsGmail(/^[^@\s]+@gmail\.com$/.test(normalized));
            }}
            required
            aria-invalid={Boolean(error) || !isGmail || undefined}
            aria-busy={isLoading || undefined}
          />
          {emailError ? <div className="text-xs text-destructive">{emailError}</div> : null}
          <p className="text-xs text-muted-foreground">
            TabSeed is in an early experimental phase and currently only accepts Google sign-in via
            Gmail. Sorry for the inconvenience.
          </p>
          <div className="space-y-1">
            <label htmlFor="waitlist-reason" className="block text-sm font-medium">
              What makes you want to try tabseed? Is there any problem you hope tabseed can help you with?
            </label>
            <textarea
              id="waitlist-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Tell us about your workflow, problems you're facing, or what you'd like TabSeed to help with."
              aria-invalid={!isReasonValid || undefined}
              aria-busy={isLoading || undefined}
            />
            <p className="text-xs text-muted-foreground">5–1000 characters.</p>
            {reasonError ? <div className="text-xs text-destructive">{reasonError}</div> : null}
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={isLoading || !email.trim() || !isGmail || !isReasonValid}
            aria-busy={isLoading || undefined}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-3 animate-pulse rounded-full bg-foreground/40" />
                Submitting...
              </span>
            ) : (
              'Join waitlist'
            )}
          </Button>
          {!isGmail ? (
            <div role="alert" className="text-sm text-destructive">
              Please use a Gmail address (example@gmail.com).
            </div>
          ) : null}
          {message ? <div className="text-sm text-green-600">{message}</div> : null}
          {error ? (
            <div role="alert" className="text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
