export default function PendingPage() {
	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="mb-4 text-2xl font-bold">Access Pending</h1>
			<p className="mb-2 text-sm text-muted-foreground">
				Your account isn\'t approved yet. If you haven\'t joined, please submit the waitlist.
			</p>
			<p className="text-sm">
				<a className="underline" href="/waitlist">Go to waitlist</a>
			</p>
		</div>
	);
}


