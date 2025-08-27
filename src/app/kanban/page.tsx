"use client";

import { useState } from 'react';

import { Fab } from '@/components/fab/fab';
import { type ImportTarget, ImportTargetDialog } from '@/components/fab/import-target-dialog';
import { useExtensionStatus } from '@/hooks/use-extension-status';
import { ApiError } from '@/lib/api/errors';
import { postImportsTabs } from '@/lib/api/imports-client';
import { captureOpenTabs } from '@/lib/extension/bridge';

export default function KanbanIndexPage() {
	const [open, setOpen] = useState(false);
	const [lastResult, setLastResult] = useState<{ created: number; reused: number; ignored: number } | null>(null);
	const extStatus = useExtensionStatus();

	const handleConfirm = async (target: ImportTarget, options: { closeImported: boolean }) => {
		try {
			const tabs = await captureOpenTabs({ closeImported: options.closeImported });
			const res = await postImportsTabs(
				{
					tabs,
					target: target.type === 'inbox' ? { inbox: true } : { boardId: target.boardId },
					closeImported: options.closeImported,
				},
				{ idempotencyKey: crypto.randomUUID() },
			);
			setLastResult({ created: res.created.length, reused: res.reused.length, ignored: res.ignored.length });
		} catch (err) {
			if (err instanceof ApiError && err.isUnauthorized) {
				window.location.href = '/login';
				return;
			}
			throw err as Error;
		}
	};

	return (
		<div className="min-h-[60svh] p-6">
			<h1 className="mb-4 text-2xl font-bold">Kanban</h1>
			<p className="text-muted-foreground">這裡是 Kanban 的入口。</p>
			<div className="mt-2 text-xs text-muted-foreground">
				擴充狀態：{extStatus === 'unknown' ? '檢測中…' : extStatus === 'available' ? '可用' : '未偵測到（將採用單頁擷取）'}
			</div>
			{lastResult ? (
				<div className="mt-3 rounded-md border p-3 text-sm">
					<div className="font-medium">最近一次匯入結果</div>
					<div className="mt-1 text-muted-foreground">created: {lastResult.created}、reused: {lastResult.reused}、ignored: {lastResult.ignored}</div>
				</div>
			) : null}

			<Fab label="匯入分頁" onClick={() => setOpen(true)} />
			<ImportTargetDialog open={open} onOpenChange={setOpen} onConfirm={handleConfirm} />
		</div>
	);
}
