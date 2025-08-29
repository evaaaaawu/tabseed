import { cn } from '@/lib/utils';

export function Surface({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-card text-card-foreground rounded-lg shadow-elev-1', className)} {...props} />;
}
