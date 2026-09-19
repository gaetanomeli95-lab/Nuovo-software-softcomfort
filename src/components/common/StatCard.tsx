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
  default: 'bg-primary/10 text-primary',
  warning: 'bg-warning/20 text-warning-foreground',
  success: 'bg-success/15 text-success',
  info: 'bg-info/15 text-info',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({ label, value, sub, icon: Icon, to, tone = 'default', loading }: StatCardProps) {
  const inner = (
    <Card className={cn('transition-shadow', to && 'hover:shadow-[var(--shadow-pop)]')}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('rounded-lg p-2.5', TONE_ICON[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-20" />
          ) : (
            <p className="tnum truncate text-xl font-semibold leading-tight">{value}</p>
          )}
          {sub && !loading && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">{inner}</Link> : inner;
}
