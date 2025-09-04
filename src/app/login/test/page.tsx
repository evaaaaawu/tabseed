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
		<div className="mx-auto max-w-md p-6">
			<h1 className="mb-4 text-2xl font-bold">Test Login</h1>
			<p className="mb-4 text-sm text-muted-foreground">Enter test code to log in to TabSeed.</p>
			<form onSubmit={handleSubmit} className="space-y-3">
				<Input
					placeholder="Enter test code"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					autoFocus
					required
				/>
				<div className="flex items-center gap-2">
					<Button type="submit" disabled={isLoading || !code.trim()}>
						{isLoading ? "Logging in..." : "Login"}
					</Button>
					<Link className="text-sm text-primary underline" href="/login">
						Back to Login
					</Link>
				</div>
				{error ? <div className="text-sm text-destructive">{error}</div> : null}
			</form>
		</div>
	);
}


