"use client";

import { useState } from 'react';

import { Fab } from '@/components/fab/fab';
import { ImportTargetDialog, type ImportTarget } from '@/components/fab/import-target-dialog';

export default function KanbanIndexPage() {
	const [open, setOpen] = useState(false);

	const handleConfirm = async (_target: ImportTarget) => {
		// 後續會呼叫 imports API，這步先佔位
		await new Promise((r) => setTimeout(r, 300));
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
