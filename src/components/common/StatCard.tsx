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
  default: 'border-primary/20 bg-primary/10 text-primary',
  warning: 'border-brand-gold/20 bg-brand-gold/10 text-brand-gold',
  success: 'border-success/20 bg-success/10 text-success',
  info: 'border-info/20 bg-info/10 text-info',
  destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
};

export function StatCard({ label, value, sub, icon: Icon, to, tone = 'default', loading }: StatCardProps) {
  const inner = (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        to && 'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_50px_rgba(0,0,0,0.36)]',
      )}
    >
      <div className="brand-divider absolute inset-x-0 top-0 h-px opacity-65" />
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('rounded-xl border p-2.5', TONE_ICON[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-20" />
          ) : (
            <p className="tnum mt-0.5 truncate text-xl font-semibold leading-tight text-foreground">{value}</p>
          )}
          {sub && !loading && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );

  return to ? (
    <Link to={to} className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {inner}
    </Link>
  ) : (
    inner
  );
}
