'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
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
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Join the Waitlist</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Enter your email and we\'ll notify you when approved.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={isLoading || !email.trim()}>
          Submit
        </Button>
        {message ? <div className="text-sm text-green-600">{message}</div> : null}
        {error ? <div className="text-sm text-destructive">{error}</div> : null}
      </form>
    </div>
  );
}
