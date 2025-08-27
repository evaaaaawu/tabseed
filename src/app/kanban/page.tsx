"use client";

import { useState } from 'react';

import { Fab } from '@/components/fab/fab';
import { type ImportTarget,ImportTargetDialog } from '@/components/fab/import-target-dialog';
import { postImportsTabs } from '@/lib/api/imports-client';

export default function KanbanIndexPage() {
	const [open, setOpen] = useState(false);

	const handleConfirm = async (target: ImportTarget) => {
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
			<h1 className="mb-4 text-2xl font-bold">Kanban</h1>
			<p className="text-muted-foreground">這裡會顯示 Kanban 列表與進入各看板（MVP 佔位）。</p>

			<Fab label="匯入分頁" onClick={() => setOpen(true)} />
			<ImportTargetDialog open={open} onOpenChange={setOpen} onConfirm={handleConfirm} />
		</div>
	);
}
