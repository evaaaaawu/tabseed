import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badge = cva('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'bg-accent text-accent-foreground',
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      info: 'bg-info text-info-foreground',
    },
    variant: {
      solid: '',
      soft: 'opacity-90',
      outline: 'bg-transparent border border-border',
    },
  },
  defaultVariants: { tone: 'neutral', variant: 'solid' },
});

export function Badge(
  { className, tone, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>,
) {
  return <span className={cn(badge({ tone, variant }), className)} {...props} />;
}
