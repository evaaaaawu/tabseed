"use client";

import Link from 'next/link';

export default function LoginPage() {
	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="mb-4 text-2xl font-bold">Login</h1>
			<div className="space-y-2">
				<a
					className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
					href="/api/auth/google"
				>
					Continue with Google
				</a>
				<div className="text-sm">
					Don\'t have access yet?{' '}
					<a className="underline" href="/waitlist">Join the waitlist</a>.
				</div>
				<div className="text-sm">
					Testing? Use the <Link className="underline" href="/login/test">test code login</Link>.
				</div>
				<Link className="text-sm text-primary underline" href="/">
					Back to Home
				</Link>
			</div>
		</div>
	);
}
