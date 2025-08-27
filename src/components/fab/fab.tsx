import { Plus } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	readonly label?: string;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
	{ className, label = 'Add', ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			className={cn(
				'fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				className,
			)}
			{...props}
		>
			<Plus className="h-5 w-5" />
			<span className="hidden sm:inline text-sm font-medium">{label}</span>
		</button>
	);
});
