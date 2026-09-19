import type { SellingBill, SellingBillStatus } from '@/types/domain';

/**
 * Logica di filtro/ordinamento/paginazione della lista vendite.
 * Pura e testabile — nessuna dipendenza da React.
 */

export type SortKey = 'date' | 'client' | 'seller' | 'totalPrice' | 'status';
export type SortDir = 'asc' | 'desc';

export interface BillFilters {
  search: string;
  status: SellingBillStatus | 'all';
  seller: string | 'all';
  dateFrom: string; // yyyy-MM-dd o ''
  dateTo: string;   // yyyy-MM-dd o ''
}

export const DEFAULT_FILTERS: BillFilters = {
  search: '',
  status: 'all',
  seller: 'all',
  dateFrom: '',
  dateTo: '',
};

export function filterBills(bills: SellingBill[], f: BillFilters): SellingBill[] {
  const q = f.search.trim().toLowerCase();
  return bills.filter((b) => {
    if (f.status !== 'all' && b.status !== f.status) return false;
    if (f.seller !== 'all' && b.seller !== f.seller) return false;
    if (f.dateFrom && b.date < f.dateFrom) return false;
    if (f.dateTo && b.date > f.dateTo) return false;
    if (q) {
      const haystack = [b.client, b.seller, b.address, b.phone, b.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const inItems = (b.items ?? []).some((i) => i.name?.toLowerCase().includes(q));
      if (!haystack.includes(q) && !inItems) return false;
    }
    return true;
  });
}

export function sortBills(bills: SellingBill[], key: SortKey, dir: SortDir): SellingBill[] {
  const mul = dir === 'asc' ? 1 : -1;
  return [...bills].sort((a, b) => {
    switch (key) {
      case 'date':
        return (a.date ?? '').localeCompare(b.date ?? '') * mul;
      case 'client':
        return (a.client ?? '').localeCompare(b.client ?? '', 'it') * mul;
      case 'seller':
        return (a.seller ?? '').localeCompare(b.seller ?? '', 'it') * mul;
      case 'totalPrice':
        return ((a.totalPrice ?? 0) - (b.totalPrice ?? 0)) * mul;
      case 'status':
        return (a.status ?? '').localeCompare(b.status ?? '', 'it') * mul;
    }
  });
}

export function uniqueSellers(bills: SellingBill[]): string[] {
  return [...new Set(bills.map((b) => b.seller).filter((s): s is string => Boolean(s?.trim())))]
    .sort((a, b) => a.localeCompare(b, 'it'));
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice(page * pageSize, (page + 1) * pageSize);
}

export function totalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

/** Totale importo delle fatture filtrate (escludendo annullate). */
export function sumTotal(bills: SellingBill[]): number {
  return bills
    .filter((b) => b.status !== 'Annullata')
    .reduce((s, b) => s + (b.totalPrice ?? 0), 0);
}
