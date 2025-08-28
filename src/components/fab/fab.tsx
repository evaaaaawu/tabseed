import { Plus } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	readonly label?: string;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
	{ className, label = 'Add', ...props },
	ref,
) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					ref={ref}
					className={cn(
						'fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
						className,
					)}
					{...props}
				>
					<Plus className="size-5" />
				</button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Import Tabs</p>
			</TooltipContent>
		</Tooltip>
	);
});
