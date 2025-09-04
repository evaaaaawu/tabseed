"use client";

export default function PendingWaitlistPage() {
	const email = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null;
	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="mb-4 text-2xl font-bold">Your request is pending</h1>
			<p className="mb-2 text-sm text-muted-foreground">
				{email ? `${email} ` : ''}is already on the waitlist. We\'ll notify you after approval.
			</p>
			<a className="underline" href="/login">Back to login</a>
		</div>
	);
}


