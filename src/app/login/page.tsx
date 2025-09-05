"use client";

import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sign in to TabSeed</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Capture tabs effortlessly. Organize with zero friction.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-3">
          <Button asChild className="w-full">
            <a href="/api/auth/google">Continue with Google</a>
          </Button>
        </div>

        <div className="mt-5 space-y-2 text-sm text-muted-foreground sm:mt-6">
          <p className="font-semibold text-foreground">
            TabSeed is currently in an early experimental phase with limited access. If you&apos;re
            interested, please apply to the{' '}
            <a className="text-primary underline hover:text-primary/90" href="/waitlist">
              waitlist
            </a>{' '}
            and we&apos;ll notify you once approved.
          </p>
          <p className="text-xs">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
