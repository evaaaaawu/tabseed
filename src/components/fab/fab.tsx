import { Plus } from 'lucide-react';
import { forwardRef } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
						'fixed bottom-8 right-8 inline-flex items-center justify-center rounded-full bg-primary p-4 text-primary-foreground shadow-2xl transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
						className,
					)}
					{...props}
				>
					<Plus className="size-7" />
				</button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Import Tabs</p>
			</TooltipContent>
		</Tooltip>
	);
});
