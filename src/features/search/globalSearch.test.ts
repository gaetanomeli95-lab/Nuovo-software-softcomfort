import { describe, expect, it } from 'vitest';
import type { SellingBill } from '@/types/domain';
import { buildGlobalSearch, globalSearchCount } from './globalSearch';

const sale: SellingBill = {
  uuid: 's1',
  date: '2026-09-25',
  seller: 'Stefania',
  client: 'Mario Rossi',
  address: 'Palermo',
  phone: '333',
  status: 'Da Ordinare',
  delivered: false,
  items: [{
    uuid: 'i1',
    name: 'Divano Turi',
    price: 1000,
    ordered: false,
    company: 'AD Sofa',
    arrived: false,
    delivered: false,
  }],
  transport: 0,
  itemsPrice: 1000,
  totalPrice: 1000,
  settlement: 0,
  assistance: false,
  notes: '',
  deposits: [],
  provision: null,
};

describe('global search', () => {
  it('cerca anche dentro gli articoli delle vendite', () => {
    const groups = buildGlobalSearch('turi', {
      sales: [sale],
      purchases: [],
      inventory: [],
      pending: [],
      checks: [],
    });
    expect(groups.sales).toHaveLength(1);
    expect(globalSearchCount(groups)).toBe(1);
  });

  it('restituisce gruppi vuoti per query vuota', () => {
    const groups = buildGlobalSearch(' ', {
      sales: [sale],
      purchases: [],
      inventory: [],
      pending: [],
      checks: [],
    });
    expect(globalSearchCount(groups)).toBe(0);
  });
});
