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

export function getDeliveryEntries(
  bills: SellingBill[],
  todayISO = new Date().toISOString().slice(0, 10),
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
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function deliveryCounts(entries: DeliveryEntry[]) {
  return {
    late: entries.filter((entry) => entry.state === 'late').length,
    today: entries.filter((entry) => entry.state === 'today').length,
    upcoming: entries.filter((entry) => entry.state === 'upcoming').length,
    completed: entries.filter((entry) => entry.state === 'completed').length,
  };
}
