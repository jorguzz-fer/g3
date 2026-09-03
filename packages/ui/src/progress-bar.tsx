import { cn } from './cn';

export interface ProgressBarProps {
  /** Progresso de 0 a 100. */
  value: number;
  className?: string;
  'aria-label'?: string;
}

/** Barra de progresso com preenchimento em gradiente verde→dourado (DS §7). */
export function ProgressBar({ value, className, ...aria }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-navy-50', className)}
      {...aria}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#1C3466,#C9A04A)' }}
      />
    </div>
  );
}
