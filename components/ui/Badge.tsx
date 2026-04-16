import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'new' | 'sale' | 'bestseller' | 'lowstock';
  className?: string;
}

export function Badge({ children, variant = 'new', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-display font-bold uppercase tracking-wide',
        {
          'bg-(--color-primary) text-white': variant === 'new',
          'bg-(--color-accent) text-white': variant === 'sale',
          'bg-(--color-trust) text-white': variant === 'bestseller',
          'bg-orange-500 text-white animate-pulse': variant === 'lowstock',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
