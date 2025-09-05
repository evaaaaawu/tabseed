import * as React from 'react';
import { cn } from '@/lib/utils';

export const Surface = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg bg-card text-card-foreground shadow-elev-1', className)}
        {...props}
      />
    );
  },
);
Surface.displayName = 'Surface';
