import type {
  BuyingBill,
  InventoryItem,
  PendingOrder,
  SellingBill,
} from '@/types/domain';

export interface CustomerDirectoryRow {
  key: string;
  name: string;
  phone: string;
  address: string;
  salesCount: number;
  totalSpent: number;
  lastSaleDate: string;
}

export interface SupplierDirectoryRow {
  key: string;
  name: string;
  purchaseCount: number;
  purchaseValue: number;
  inventoryItems: number;
  pendingOrders: number;
}

export function customerDirectoryKey(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('it');
}

export function buildCustomerDirectory(bills: SellingBill[]): CustomerDirectoryRow[] {
  const map = new Map<string, CustomerDirectoryRow>();

  const sorted = [...bills].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  for (const bill of sorted) {
    if (bill.status === 'Annullata') continue;
    const name = bill.client?.trim();
    const key = customerDirectoryKey(name);
    if (!key) continue;

    const current = map.get(key);
    if (!current) {
      map.set(key, {
        key,
        name: name || key,
        phone: bill.phone?.trim() || '',
        address: bill.address?.trim() || '',
        salesCount: 1,
        totalSpent: Math.max(0, Number(bill.totalPrice ?? 0)),
        lastSaleDate: bill.date ?? '',
      });
      continue;
    }

    current.salesCount += 1;
    current.totalSpent += Math.max(0, Number(bill.totalPrice ?? 0));
    if (!current.phone && bill.phone) current.phone = bill.phone.trim();
    if (!current.address && bill.address) current.address = bill.address.trim();
  }

  return [...map.values()].sort((a, b) =>
    b.lastSaleDate.localeCompare(a.lastSaleDate) || a.name.localeCompare(b.name, 'it'));
}

export function buildSupplierDirectory(
  buyingBills: BuyingBill[],
  inventory: InventoryItem[],
  pending: PendingOrder[],
): SupplierDirectoryRow[] {
  const map = new Map<string, SupplierDirectoryRow>();

  const ensure = (rawName: string | null | undefined) => {
    const name = rawName?.trim() ?? '';
    const key = customerDirectoryKey(name);
    if (!key) return null;

    const existing = map.get(key);
    if (existing) return existing;

    const row: SupplierDirectoryRow = {
      key,
      name,
      purchaseCount: 0,
      purchaseValue: 0,
      inventoryItems: 0,
      pendingOrders: 0,
    };
    map.set(key, row);
    return row;
  };

  for (const bill of buyingBills) {
    const row = ensure(bill.make);
    if (!row || bill.status === 'Annullata') continue;
    row.purchaseCount += 1;
    row.purchaseValue += (bill.items ?? []).reduce(
      (sum, item) => sum + Math.max(0, Number(item.price ?? 0)),
      0,
    );
  }

  for (const item of inventory) {
    const row = ensure(item.make);
    if (row) row.inventoryItems += 1;
  }

  for (const order of pending) {
    const row = ensure(order.company);
    if (row && !order.delivered) row.pendingOrders += 1;
  }

  return [...map.values()].sort((a, b) =>
    b.purchaseValue - a.purchaseValue || a.name.localeCompare(b.name, 'it'));
}
