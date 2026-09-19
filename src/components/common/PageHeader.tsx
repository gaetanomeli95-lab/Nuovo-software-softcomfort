import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-px w-7 bg-primary" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Soft Comfort
          </p>
        </div>
        <h1 className="font-display text-[28px] font-bold leading-none tracking-[-0.02em] text-foreground sm:text-[31px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
