import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  to?: string;
  tone?: 'default' | 'warning' | 'success' | 'info' | 'destructive';
  loading?: boolean;
}

const TONE_ICON: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'border-[#f6c7ca] bg-[#fff0f1] text-primary',
  warning: 'border-[#ead8b9] bg-[#fbf3e5] text-[#9a6b24]',
  success: 'border-[#c8e2d3] bg-[#edf7f1] text-success',
  info: 'border-[#cadbea] bg-[#eef5fa] text-info',
  destructive: 'border-[#efcbd0] bg-[#fff0f2] text-destructive',
};

export function StatCard({ label, value, sub, icon: Icon, to, tone = 'default', loading }: StatCardProps) {
  const inner = (
    <Card
      className={cn(
        'group relative overflow-hidden',
        to && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d6ccc1] hover:shadow-[var(--shadow-card-hover)]',
      )}
    >
      <CardContent className="flex min-h-[104px] items-center gap-4 p-5">
        <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl border', TONE_ICON[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="tnum mt-1 truncate text-[23px] font-bold leading-none tracking-[-0.02em] text-foreground">
              {value}
            </p>
          )}
          {sub && !loading && (
            <p className="mt-1.5 truncate text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return to ? (
    <Link
      to={to}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {inner}
    </Link>
  ) : (
    inner
  );
}
