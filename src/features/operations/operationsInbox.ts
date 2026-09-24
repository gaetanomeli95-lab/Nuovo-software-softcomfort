import type {
  Check,
  DepositResponse,
  ProvisionResponse,
  SellingBill,
} from '@/types/domain';
import { getDeliveryEntries, localISODate } from '@/features/selling-bills/deliveryPlanning';
import { getSaleClosureReadiness } from '@/features/selling-bills/paymentStatus';

export type WorkPriority = 'critical' | 'warning' | 'normal' | 'positive';

export interface WorkItem {
  id: string;
  title: string;
  detail: string;
  to: string;
  priority: WorkPriority;
  date?: string;
}

export interface OperationsInbox {
  urgent: WorkItem[];
  sales: WorkItem[];
  collections: WorkItem[];
  administration: WorkItem[];
}

export function buildOperationsInbox(
  bills: SellingBill[],
  deposits: DepositResponse[],
  provisions: ProvisionResponse[],
  checks: Check[],
  todayISO = localISODate(),
): OperationsInbox {
  const urgent: WorkItem[] = [];
  const sales: WorkItem[] = [];
  const collections: WorkItem[] = [];
  const administration: WorkItem[] = [];

  for (const entry of getDeliveryEntries(bills, todayISO)) {
    if (entry.state !== 'late' && entry.state !== 'today') continue;
    urgent.push({
      id: `delivery-${entry.bill.uuid}`,
      title: entry.state === 'late'
        ? `Consegna in ritardo · ${entry.bill.client}`
        : `Consegna oggi · ${entry.bill.client}`,
      detail: [
        entry.metadata.scheduledTime ? `ore ${entry.metadata.scheduledTime}` : '',
        entry.metadata.city || entry.bill.address || '',
      ].filter(Boolean).join(' · ') || 'Apri la vendita per i dettagli',
      to: `/vendite/${entry.bill.uuid}`,
      priority: entry.state === 'late' ? 'critical' : 'warning',
      date: entry.metadata.scheduledDate,
    });
  }

  const today = new Date(`${todayISO}T00:00:00`);

  for (const check of checks) {
    const target = new Date(`${check.expireDate}T00:00:00`);
    const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);

    // Il modello legacy non espone uno stato "incassato" per gli assegni.
    // Per evitare falsi allarmi su storico vecchio mostriamo solo scadenze future/odierne.
    if (days < 0 || days > 30) continue;

    urgent.push({
      id: `check-${check.uuid}`,
      title: days === 0
        ? `Assegno in scadenza oggi · ${check.make}`
        : `Assegno in scadenza · ${check.make}`,
      detail: days === 0 ? 'Scadenza odierna' : `Scade tra ${days} giorni`,
      to: '/assegni',
      priority: days === 0 ? 'critical' : 'warning',
      date: check.expireDate,
    });
  }

  for (const bill of bills) {
    if (bill.status === 'Da Ordinare') {
      sales.push({
        id: `order-${bill.uuid}`,
        title: `Da ordinare · ${bill.client || 'Cliente'}`,
        detail: `${bill.items?.length ?? 0} articoli · ${bill.seller || 'Venditore non indicato'}`,
        to: `/vendite/${bill.uuid}`,
        priority: 'normal',
        date: bill.date,
      });
    }

    const closure = getSaleClosureReadiness(bill);
    if (
      closure.ready &&
      bill.status !== 'Chiusa' &&
      bill.status !== 'Annullata'
    ) {
      sales.push({
        id: `close-${bill.uuid}`,
        title: `Pronta per chiusura · ${bill.client || 'Cliente'}`,
        detail: 'Merce consegnata e pagamento completato',
        to: `/vendite/${bill.uuid}`,
        priority: 'positive',
        date: bill.date,
      });
    }
  }

  for (const row of deposits) {
    collections.push({
      id: `deposit-${row.deposit.uuid}`,
      title: `Acconto da incassare · ${row.client || 'Cliente'}`,
      detail: `${row.deposit.method} · ${row.deposit.seller}`,
      to: `/vendite/${row.uuid}`,
      priority: 'warning',
      date: row.deposit.date,
    });
  }

  for (const row of provisions) {
    administration.push({
      id: `provision-${row.provision.uuid}`,
      title: `Provvigione da pagare · ${row.provision.seller}`,
      detail: row.client || 'Vendita associata',
      to: `/vendite/${row.uuid}`,
      priority: 'normal',
    });
  }

  urgent.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  sales.sort((a, b) => {
    const priorityRank: Record<WorkPriority, number> = {
      critical: 0,
      warning: 1,
      positive: 2,
      normal: 3,
    };
    return priorityRank[a.priority] - priorityRank[b.priority] ||
      (a.date ?? '').localeCompare(b.date ?? '');
  });
  collections.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  return { urgent, sales, collections, administration };
}
