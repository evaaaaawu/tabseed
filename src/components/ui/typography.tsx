import { cn } from '@/lib/utils';

/**
 * Mobile-first typography scale aligned to @ui-designer.md
 * - Display: 36/40
 * - H1: 30/36
 * - H2: 24/32
 * - H3: 20/28
 * - Body md: 16/24
 * - Body sm: 14/20
 * - Body xs/tiny: 12/16
 */
export function Heading(
  props: React.HTMLAttributes<HTMLHeadingElement> & { as?: 'display' | 'h1' | 'h2' | 'h3' },
) {
  const { as = 'h1', className, ...rest } = props;
  const Comp = (as === 'display' ? 'h1' : as) as 'h1' | 'h2' | 'h3';
  const map = {
    display: 'text-4xl leading-10 font-bold tracking-tight', // 36/40
    h1: 'text-3xl leading-9 font-bold tracking-tight', // 30/36
    h2: 'text-2xl leading-8 font-bold tracking-tight', // 24/32
    h3: 'text-xl leading-7 font-semibold tracking-tight', // 20/28
  } as const;
  return <Comp className={cn(map[as], className)} {...rest} />;
}

export function Text(
  props: React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    muted?: boolean;
  },
) {
  const { size = 'md', muted, className, ...rest } = props;
  const map = {
    xs: 'text-xs leading-4', // 12/16 (Tiny)
    sm: 'text-sm leading-5', // 14/20
    md: 'text-base leading-6', // 16/24
    lg: 'text-lg leading-7', // 18/28 (close to 20/28 but keeps Tailwind preset)
  } as const;
  return <p className={cn(map[size], muted && 'text-muted-foreground', className)} {...rest} />;
}
