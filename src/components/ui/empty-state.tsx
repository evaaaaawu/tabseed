import { cn } from '@/lib/utils';
import { Text } from './typography';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-md border p-6 text-center', className)}>
      {icon ? <div className="mx-auto mb-3 text-muted-foreground">{icon}</div> : null}
      {title ? <div className="mb-1 text-base font-medium">{title}</div> : null}
      {description ? (
        <Text size="sm" muted>
          {description}
        </Text>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
