import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { SellingBillStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<SellingBillStatus, BadgeProps['variant']> = {
  'Da Ordinare': 'warning',
  'Ordinato': 'info',
  'Pronta': 'default',
  'Consegnata': 'secondary',
  'Chiusa': 'success',
  'Annullata': 'destructive',
};

const STATUS_DOT: Record<SellingBillStatus, string> = {
  'Da Ordinare': 'bg-warning',
  'Ordinato': 'bg-info',
  'Pronta': 'bg-primary',
  'Consegnata': 'bg-secondary-foreground',
  'Chiusa': 'bg-success',
  'Annullata': 'bg-destructive',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = (STATUS_VARIANT as Record<string, BadgeProps['variant']>)[status] ?? 'muted';
  const dot = (STATUS_DOT as Record<string, string>)[status];
  return (
    <Badge variant={variant} className={cn('whitespace-nowrap', className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {status}
    </Badge>
  );
}
