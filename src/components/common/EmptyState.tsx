import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2.5 px-4 py-14 text-center', className)}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#e5ddd4] bg-[#f7f3ee]">
        <Icon className="h-5 w-5 text-[#8b7f77]" />
      </div>
      <p className="mt-1 text-sm font-bold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
