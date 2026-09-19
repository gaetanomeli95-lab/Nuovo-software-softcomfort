import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { PaymentStatus } from '@/features/selling-bills/paymentStatus';
import { cn } from '@/lib/utils';

const PAYMENT_VARIANT: Record<PaymentStatus, BadgeProps['variant']> = {
  'Da pagare': 'warning',
  'Parziale': 'info',
  'Pagata': 'success',
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant={PAYMENT_VARIANT[status]}
      className={cn('whitespace-nowrap', className)}
    >
      {status}
    </Badge>
  );
}
