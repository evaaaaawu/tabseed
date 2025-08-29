import { cn } from '@/lib/utils';

export function Surface({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg bg-card text-card-foreground shadow-elev-1', className)} {...props} />;
}
