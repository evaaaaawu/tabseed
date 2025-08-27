"use client";

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postTestLogin } from '@/lib/api/auth-client';

export default function LoginPage() {
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		try {
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
			<h1 className="mb-4 text-2xl font-bold">登入</h1>
			<p className="mb-4 text-sm text-muted-foreground">輸入測試碼以登入 TabSeed。</p>
			<form onSubmit={handleSubmit} className="space-y-3">
				<Input
					placeholder="輸入測試碼"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					required
				/>
				<div className="flex items-center gap-2">
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "登入中..." : "登入"}
					</Button>
					<Link className="text-sm text-primary underline" href="/">
						回首頁
					</Link>
				</div>
				{error ? <div className="text-sm text-destructive">{error}</div> : null}
			</form>
		</div>
	);
}
