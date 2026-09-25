import type { SellingBill } from '@/types/domain';

export interface CustomerSuggestion {
  key: string;
  name: string;
  phone: string;
  address: string;
  lastDate: string;
  saleCount: number;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('it')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function buildCustomerSuggestions(
  bills: SellingBill[],
  query: string,
  limit = 5,
): CustomerSuggestion[] {
  const needle = normalize(query);
  if (needle.length < 2) return [];

  const customers = new Map<string, CustomerSuggestion>();

  const sorted = [...bills].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  for (const bill of sorted) {
    const name = bill.client?.trim();
    if (!name) continue;

    const key = normalize(name);
    const haystack = normalize([name, bill.phone ?? '', bill.address ?? ''].join(' '));
    if (!haystack.includes(needle)) continue;

    const current = customers.get(key);
    if (!current) {
      customers.set(key, {
        key,
        name,
        phone: bill.phone?.trim() ?? '',
        address: bill.address?.trim() ?? '',
        lastDate: bill.date ?? '',
        saleCount: 1,
      });
      continue;
    }

    current.saleCount += 1;
    if (!current.phone && bill.phone) current.phone = bill.phone.trim();
    if (!current.address && bill.address) current.address = bill.address.trim();
  }

  return [...customers.values()]
    .sort((a, b) => {
      const aStarts = normalize(a.name).startsWith(needle) ? 0 : 1;
      const bStarts = normalize(b.name).startsWith(needle) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return b.lastDate.localeCompare(a.lastDate);
    })
    .slice(0, Math.max(1, limit));
}
