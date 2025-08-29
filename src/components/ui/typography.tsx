import { cn } from '@/lib/utils';

export function Heading(
  props: React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' },
) {
  const { as = 'h1', className, ...rest } = props;
  const Comp = as as keyof JSX.IntrinsicElements;
  const map = {
    h1: 'text-3xl leading-9 font-bold tracking-tight',
    h2: 'text-2xl leading-8 font-bold tracking-tight',
    h3: 'text-xl leading-7 font-semibold',
  } as const;
  return <Comp className={cn(map[as], className)} {...(rest as any)} />;
}

export function Text(
  props: React.HTMLAttributes<HTMLParagraphElement> & { size?: 'sm' | 'md' | 'lg'; muted?: boolean },
) {
  const { size = 'md', muted, className, ...rest } = props;
  const map = { sm: 'text-sm leading-5', md: 'text-base leading-6', lg: 'text-lg leading-7' } as const;
  return <p className={cn(map[size], muted && 'text-muted-foreground', className)} {...rest} />;
}
