"use client";

export default function NeedJoinPage() {
	const email = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null;
	const href = email ? `/waitlist?email=${encodeURIComponent(email)}` : '/waitlist';
	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="mb-4 text-2xl font-bold">You\'re not on the waitlist yet</h1>
			<p className="mb-2 text-sm text-muted-foreground">Join the waitlist to request access.</p>
			<a className="underline" href={href}>Join the waitlist</a>
		</div>
	);
}


