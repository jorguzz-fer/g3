import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export type BadgeVariant = 'category' | 'highlight' | 'new' | 'level';

const variants: Record<BadgeVariant, string> = {
  category: 'bg-navy-50 text-navy-700',
  highlight: 'bg-gold-50 text-gold-600',
  new: 'bg-navy-700 text-white',
  level: 'border border-navy-700 text-navy-700',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/** Pílula de categoria/destaque/nível (G3DesignSystem §7). */
export function Badge({ variant = 'category', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
