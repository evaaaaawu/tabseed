"use client";

import { Button } from '@/components/ui/button';

export default function NeedJoinPage() {
	const email = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null;
	const href = email ? `/waitlist?email=${encodeURIComponent(email)}` : '/waitlist';
	const loginHref = '/login';

	return (
		<div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-8 sm:py-12">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold tracking-tight md:text-4xl">Not on the waitlist yet</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">
					{email ? <span className="font-medium text-foreground">{email}</span> : 'This email'} isn&apos;t on our waitlist. Join to request access.
				</p>
			</div>

			<div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
				<div className="space-y-3">
					<Button asChild className="w-full">
						<a href={href}>Join the waitlist</a>
					</Button>
					<Button asChild variant="ghost" className="w-full">
						<a href={loginHref}>Back to login</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
