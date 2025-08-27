"use client";

import { ChevronDown, Inbox, Layout, Loader2 } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ImportTarget =
	| { type: 'inbox' }
	| { type: 'kanban'; boardId?: string };

interface ImportTargetDialogProps {
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
	readonly onConfirm: (target: ImportTarget) => Promise<void> | void;
}

export function ImportTargetDialog({ open, onOpenChange, onConfirm }: ImportTargetDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [target, setTarget] = useState<ImportTarget>({ type: 'inbox' });

	const handleConfirm = async () => {
		try {
			setIsLoading(true);
			await onConfirm(target);
			onOpenChange(false);
		} finally {
			setIsLoading(false);
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
			<div
				className="absolute inset-0 bg-black/40"
				onClick={() => onOpenChange(false)}
				aria-hidden
			/>
			<div className="relative z-10 w-full max-w-md rounded-lg border bg-background p-4 shadow-2xl">
				<h2 className="mb-3 text-lg font-semibold">匯入目標</h2>
				<div className="space-y-2">
					<button
						className={cn(
							'flex w-full items-center gap-3 rounded-md border p-3 text-left hover:bg-accent',
							target.type === 'inbox' && 'border-primary bg-primary/5',
						)}
						onClick={() => setTarget({ type: 'inbox' })}
					>
						<Inbox className="size-5" />
						<div>
							<div className="font-medium">Inbox</div>
							<div className="text-xs text-muted-foreground">匯入到收件匣</div>
						</div>
					</button>

					<button
						className={cn(
							'flex w-full items-center justify-between rounded-md border p-3 text-left hover:bg-accent',
							target.type === 'kanban' && 'border-primary bg-primary/5',
						)}
						onClick={() => setTarget({ type: 'kanban' })}
					>
						<span className="inline-flex items-center gap-3">
							<Layout className="size-5" />
							<span>
								<div className="font-medium">Kanban</div>
								<div className="text-xs text-muted-foreground">匯入到指定看板</div>
							</span>
						</span>
						<ChevronDown className="size-4 opacity-60" />
					</button>

					{target.type === 'kanban' ? (
						<div className="rounded-md border p-3">
							<label className="mb-1 block text-xs text-muted-foreground">選擇看板（MVP 先以假資料）</label>
							<div className="grid grid-cols-2 gap-2">
								{[
									{ id: 'board-1', name: 'Product' },
									{ id: 'board-2', name: 'Research' },
									{ id: 'board-3', name: 'Personal' },
								].map((b) => (
									<button
										key={b.id}
										className={cn(
											'rounded-md border p-2 text-sm hover:bg-accent',
											target.type === 'kanban' && target.boardId === b.id && 'border-primary bg-primary/5',
										)}
										onClick={() => setTarget({ type: 'kanban', boardId: b.id })}
									>
										{b.name}
									</button>
								))}
							</div>
						</div>
					) : null}
				</div>

				<div className="mt-4 flex justify-end gap-2">
					<Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
						取消
					</Button>
					<Button onClick={handleConfirm} disabled={isLoading}>
						{isLoading ? (
							<Fragment>
								<Loader2 className="mr-2 size-4 animate-spin" />
								匯入中
							</Fragment>
						) : (
							'確認'
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
