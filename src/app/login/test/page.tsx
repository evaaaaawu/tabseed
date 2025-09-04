"use client";

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postTestLogin } from '@/lib/api/auth-client';

export default function TestLoginPage() {
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		try {
			if (!code.trim()) {
				setError("Please enter a test code.");
				return;
			}
			await postTestLogin({ code });
			window.location.href = "/inbox";
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col justify-center px-6 py-8 sm:py-12">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sign in with a test code</h1>
				<p className="mt-2 text-sm text-muted-foreground sm:text-base">
					Early alpha access using a one-time test code.
				</p>
			</div>

			<div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
				<form onSubmit={handleSubmit} className="space-y-3">
					<Input
						placeholder="Enter test code"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						autoFocus
						required
					/>
					<Button className="w-full" type="submit" disabled={isLoading || !code.trim()}>
						{isLoading ? "Logging in..." : "Continue"}
					</Button>
					{error ? <div className="text-sm text-destructive">{error}</div> : null}
				</form>

				<div className="mt-5 space-y-2 text-sm text-muted-foreground sm:mt-6">
					<p>
						Prefer Google? Go back to the{' '}
						<Link className="text-primary underline hover:text-primary/90" href="/login">
							main login
						</Link>
						.
					</p>
					<p className="text-xs">
						No code yet? Join the{' '}
						<Link className="text-primary underline hover:text-primary/90" href="/waitlist">
							waitlist
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
