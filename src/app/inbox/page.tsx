"use client";

import { useState } from 'react';

import { Fab } from '@/components/fab/fab';
import { ImportTargetDialog, type ImportTarget } from '@/components/fab/import-target-dialog';
import { postImportsTabs } from '@/lib/api/imports-client';

export default function InboxPage() {
	const [open, setOpen] = useState(false);

	const handleConfirm = async (target: ImportTarget) => {
		// TODO: 串接瀏覽器擴充讀取全部開啟分頁
		const tabs = [{ url: window.location.href, title: document.title }];
		await postImportsTabs(
			{
				tabs,
				target: target.type === 'inbox' ? { inbox: true } : { boardId: target.boardId },
				closeImported: false,
			},
			{ idempotencyKey: crypto.randomUUID() },
		);
	};

	return (
		<div className="min-h-[60svh] p-6">
			<h1 className="mb-4 text-2xl font-bold">Inbox</h1>
			<p className="text-muted-foreground">這裡會顯示匯入的分頁清單（MVP 先放置佔位）。</p>

			<Fab label="匯入分頁" onClick={() => setOpen(true)} />
			<ImportTargetDialog open={open} onOpenChange={setOpen} onConfirm={handleConfirm} />
		</div>
	);
}
