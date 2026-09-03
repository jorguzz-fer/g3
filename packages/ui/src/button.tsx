import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'soft' | 'text';
export type ButtonSize = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-700/40 ' +
  'disabled:bg-[#c8cbd0] disabled:text-[#7a8079] disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-navy-700 text-white hover:bg-navy-800',
  gold: 'bg-gold-500 text-navy-900 hover:bg-gold-600',
  outline: 'border-[1.5px] border-navy-700 text-navy-700 hover:bg-navy-50',
  soft: 'bg-navy-50 text-navy-700 hover:bg-gold-50',
  text: 'text-navy-700 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  md: 'px-[22px] py-3 text-[15px]',
  sm: 'px-4 py-2 text-sm',
};

/** Resolve as classes do botão (pura — testável sem render). */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return cn(base, variants[variant], sizes[size]);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={cn(buttonClasses(variant, size), className)} {...props} />;
}
