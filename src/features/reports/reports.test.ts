import { describe, expect, it } from 'vitest';
import type { SellingBill } from '@/types/domain';
import { buildSalesReport } from './reports';

function bill(overrides: Partial<SellingBill>): SellingBill {
  return {
    uuid: 'sale',
    date: '2026-09-01',
    seller: 'Stefania',
    client: 'Cliente',
    address: '',
    phone: '',
    status: 'Chiusa',
    delivered: true,
    items: [{
      uuid: 'item',
      name: 'Art. D01 · Divano · Q.tà 2',
      price: 1000,
      ordered: true,
      company: '',
      arrived: true,
      delivered: true,
    }],
    transport: 0,
    itemsPrice: 1000,
    totalPrice: 1000,
    settlement: 0,
    assistance: false,
    notes: '',
    deposits: [{
      uuid: 'dep',
      date: '2026-09-01',
      seller: 'Stefania',
      method: 'Pos',
      amount: 400,
      collected: true,
    }],
    provision: null,
    ...overrides,
  };
}

describe('sales reports', () => {
  it('calcola fatturato, incassi registrati e residuo', () => {
    const report = buildSalesReport([
      bill({ uuid: 'a' }),
      bill({ uuid: 'b', totalPrice: 500, itemsPrice: 500, seller: 'Benedetto' }),
      bill({ uuid: 'x', status: 'Annullata', totalPrice: 999 }),
    ], { dateFrom: '', dateTo: '', seller: '' });

    expect(report.salesCount).toBe(2);
    expect(report.revenue).toBe(1500);
    expect(report.collected).toBe(800);
    expect(report.outstanding).toBe(700);
    expect(report.sellers).toHaveLength(2);
  });

  it('filtra per venditore e intervallo date', () => {
    const report = buildSalesReport([
      bill({ uuid: 'a', date: '2026-09-01' }),
      bill({ uuid: 'b', date: '2026-08-01', seller: 'Benedetto' }),
    ], { dateFrom: '2026-09-01', dateTo: '2026-09-30', seller: 'Stefania' });

    expect(report.bills.map((row) => row.uuid)).toEqual(['a']);
  });

  it('aggrega quantità prodotto dal formato moderno', () => {
    const report = buildSalesReport([
      bill({ uuid: 'a' }),
      bill({ uuid: 'b' }),
    ], { dateFrom: '', dateTo: '', seller: '' });

    expect(report.products[0].quantity).toBe(4);
    expect(report.products[0].revenue).toBe(2000);
    expect(report.products[0].salesCount).toBe(2);
  });
});
