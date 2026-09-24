import { describe, expect, it } from 'vitest';
import type { BuyingBill, InventoryItem, PendingOrder, SellingBill } from '@/types/domain';
import { buildCustomerDirectory, buildSupplierDirectory } from './directories';

const baseSale: SellingBill = {
  uuid: 's1',
  date: '2026-09-25',
  seller: 'S',
  client: 'Mario Rossi',
  address: 'Palermo',
  phone: '333',
  status: 'Chiusa',
  delivered: true,
  items: [],
  transport: 0,
  itemsPrice: 100,
  totalPrice: 100,
  settlement: 0,
  assistance: false,
  notes: '',
  deposits: [],
  provision: null,
};

describe('customer directory', () => {
  it('raggruppa clienti ignorando maiuscole e spazi', () => {
    const rows = buildCustomerDirectory([
      baseSale,
      { ...baseSale, uuid: 's2', date: '2026-09-20', client: '  mario   rossi ', totalPrice: 200 },
      { ...baseSale, uuid: 's3', client: 'Mario Rossi', status: 'Annullata', totalPrice: 999 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].salesCount).toBe(2);
    expect(rows[0].totalSpent).toBe(300);
  });
});

describe('supplier directory', () => {
  it('unisce acquisti, magazzino e ordini aperti', () => {
    const purchases: BuyingBill[] = [{
      uuid: 'b1',
      date: '2026-09-25',
      make: 'AD Sofa',
      status: 'Aperta',
      items: [{ uuid: 'i1', name: 'Divano', price: 500 }],
    }];
    const inventory: InventoryItem[] = [{
      uuid: 'i2',
      make: 'ad sofa',
      ref: '',
      name: 'Divano',
      bPrice: 0,
      necks: null,
      location: null,
      delivered: false,
    }];
    const pending: PendingOrder[] = [{
      uuid: 'p1',
      name: 'Divano',
      company: 'AD SOFA',
      delivered: false,
    }];

    const rows = buildSupplierDirectory(purchases, inventory, pending);
    expect(rows).toHaveLength(1);
    expect(rows[0].purchaseCount).toBe(1);
    expect(rows[0].purchaseValue).toBe(500);
    expect(rows[0].inventoryItems).toBe(1);
    expect(rows[0].pendingOrders).toBe(1);
  });
});
