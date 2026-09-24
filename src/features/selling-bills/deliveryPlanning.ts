import type { SellingBill } from '@/types/domain';
import { parseCommissionNotes, type CommissionMetadata } from './commissionMetadata';

export type DeliveryState = 'late' | 'today' | 'upcoming' | 'completed';

export interface DeliveryEntry {
  bill: SellingBill;
  metadata: CommissionMetadata;
  visibleNotes: string;
  state: DeliveryState;
  sortKey: string;
}

function deliveryState(
  bill: SellingBill,
  scheduledDate: string,
  todayISO: string,
): DeliveryState {
  if (bill.delivered || bill.status === 'Consegnata' || bill.status === 'Chiusa') {
    return 'completed';
  }
  if (scheduledDate < todayISO) return 'late';
  if (scheduledDate === todayISO) return 'today';
  return 'upcoming';
}

export function localISODate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDeliveryEntries(
  bills: SellingBill[],
  todayISO = localISODate(),
): DeliveryEntry[] {
  return bills
    .flatMap((bill) => {
      if (bill.status === 'Annullata') return [];

      const parsed = parseCommissionNotes(bill.notes);
      const metadata = parsed.metadata;
      if (!metadata?.scheduledDate) return [];

      return [{
        bill,
        metadata,
        visibleNotes: parsed.visibleNotes,
        state: deliveryState(bill, metadata.scheduledDate, todayISO),
        sortKey: `${metadata.scheduledDate}T${metadata.scheduledTime || '23:59'}`,
      }];
    })
    .sort((a, b) => {
      const rank: Record<DeliveryState, number> = {
        late: 0,
        today: 1,
        upcoming: 2,
        completed: 3,
      };
      const byState = rank[a.state] - rank[b.state];
      return byState || a.sortKey.localeCompare(b.sortKey);
    });
}

export function deliveryCounts(entries: DeliveryEntry[]) {
  return {
    late: entries.filter((entry) => entry.state === 'late').length,
    today: entries.filter((entry) => entry.state === 'today').length,
    upcoming: entries.filter((entry) => entry.state === 'upcoming').length,
    completed: entries.filter((entry) => entry.state === 'completed').length,
  };
}
