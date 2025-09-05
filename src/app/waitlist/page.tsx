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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined }),
      });
      if (res.ok) {
        setMessage("Thanks! We'll email you after approval.");
        setEmail('');
        setName('');
      } else if (res.status === 409) {
        setMessage("You're already on the waitlist.");
      } else {
        const text = await res.text();
        setError(`Submit failed: ${res.status} ${text}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Join the TabSeed waitlist</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Get notified when you are approved.</p>
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
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={Boolean(error) || undefined}
            aria-busy={isLoading || undefined}
          />
          <Button className="w-full" type="submit" disabled={isLoading || !email.trim()} aria-busy={isLoading || undefined}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-3 animate-pulse rounded-full bg-foreground/40" />
                Submitting...
              </span>
            ) : (
              'Join waitlist'
            )}
          </Button>
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
