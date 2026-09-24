import type {
  BuyingBill,
  Check,
  InventoryItem,
  PendingOrder,
  SellingBill,
} from '@/types/domain';

export type SearchResultKind =
  | 'sale'
  | 'purchase'
  | 'inventory'
  | 'pending'
  | 'check';

export interface GlobalSearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  detail: string;
  to: string;
}

export interface GlobalSearchGroups {
  sales: GlobalSearchResult[];
  purchases: GlobalSearchResult[];
  inventory: GlobalSearchResult[];
  pending: GlobalSearchResult[];
  checks: GlobalSearchResult[];
}

function includes(value: string | null | undefined, needle: string) {
  return (value ?? '').toLocaleLowerCase('it').includes(needle);
}

export function buildGlobalSearch(
  query: string,
  data: {
    sales: SellingBill[];
    purchases: BuyingBill[];
    inventory: InventoryItem[];
    pending: PendingOrder[];
    checks: Check[];
  },
): GlobalSearchGroups {
  const needle = query.trim().toLocaleLowerCase('it');

  if (!needle) {
    return { sales: [], purchases: [], inventory: [], pending: [], checks: [] };
  }

  const sales = data.sales
    .filter((bill) =>
      includes(bill.client, needle) ||
      includes(bill.seller, needle) ||
      includes(bill.address, needle) ||
      includes(bill.phone, needle) ||
      (bill.items ?? []).some((item) =>
        includes(item.name, needle) || includes(item.company, needle)))
    .slice(0, 20)
    .map((bill) => ({
      id: bill.uuid,
      kind: 'sale' as const,
      title: bill.client || 'Vendita',
      detail: [bill.seller, bill.status, bill.date].filter(Boolean).join(' · '),
      to: `/vendite/${bill.uuid}`,
    }));

  const purchases = data.purchases
    .filter((bill) =>
      includes(bill.make, needle) ||
      includes(bill.status, needle) ||
      (bill.items ?? []).some((item) => includes(item.name, needle)))
    .slice(0, 20)
    .map((bill) => ({
      id: bill.uuid,
      kind: 'purchase' as const,
      title: bill.make || 'Acquisto',
      detail: [bill.status, bill.date].filter(Boolean).join(' · '),
      to: `/acquisti/${bill.uuid}`,
    }));

  const inventory = data.inventory
    .filter((item) =>
      includes(item.name, needle) ||
      includes(item.make, needle) ||
      includes(item.ref, needle) ||
      includes(item.location, needle))
    .slice(0, 20)
    .map((item) => ({
      id: item.uuid,
      kind: 'inventory' as const,
      title: item.name,
      detail: [item.make, item.ref, item.location].filter(Boolean).join(' · '),
      to: `/magazzino?q=${encodeURIComponent(item.name)}`,
    }));

  const pending = data.pending
    .filter((order) =>
      includes(order.name, needle) ||
      includes(order.company, needle))
    .slice(0, 20)
    .map((order) => ({
      id: order.uuid,
      kind: 'pending' as const,
      title: order.name,
      detail: [order.company, order.ordered ? 'Ordinato' : 'Da ordinare']
        .filter(Boolean)
        .join(' · '),
      to: `/ordini?q=${encodeURIComponent(order.name)}`,
    }));

  const checks = data.checks
    .filter((check) =>
      includes(check.make, needle) ||
      includes(check.billNumbers, needle))
    .slice(0, 20)
    .map((check) => ({
      id: check.uuid,
      kind: 'check' as const,
      title: check.make,
      detail: [check.expireDate, check.billNumbers].filter(Boolean).join(' · '),
      to: `/assegni?q=${encodeURIComponent(check.make)}`,
    }));

  return { sales, purchases, inventory, pending, checks };
}

export function globalSearchCount(groups: GlobalSearchGroups) {
  return Object.values(groups).reduce((sum, rows) => sum + rows.length, 0);
}
