"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
	return (
    <div className="mx-auto max-w-lg px-6 py-10 md:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sign in to TabSeed</h1>
        <p className="mt-2 text-sm text-muted-foreground">Capture tabs effortlessly. Organize with zero friction.</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <Button asChild className="w-full">
            <a href="/api/auth/google">Continue with Google</a>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login/test">Use a test code</Link>
          </Button>
        </div>

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p>
            TabSeed is currently in an early experimental phase with limited access. If youre interested, please apply to the{' '}
            <a className="underline" href="/waitlist">waitlist</a> and well notify you once approved.
          </p>
          <p className="text-xs">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
