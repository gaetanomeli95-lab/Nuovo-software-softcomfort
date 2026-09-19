import { describe, expect, it } from 'vitest';
import { computeDashboardMetrics } from './dashboardMetrics';
import type { Check, DepositResponse, ProvisionResponse, SellingBill } from '@/types/domain';

const bill = (over: Partial<SellingBill>): SellingBill => ({
  uuid: Math.random().toString(36).slice(2),
  date: '2026-06-01',
  seller: 'Stefania',
  client: 'X',
  address: '',
  phone: '',
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
  ...over,
});

describe('computeDashboardMetrics', () => {
  it('calcola KPI base', () => {
    const bills = [
      bill({ status: 'Chiusa', totalPrice: 100 }),
      bill({ status: 'Da Ordinare', totalPrice: 50 }),
      bill({ status: 'Annullata', totalPrice: 999 }),
    ];
    const m = computeDashboardMetrics(bills, [], [], []);
    expect(m.totaleFatture).toBe(3);
    expect(m.fatturatoTotale).toBe(150); // esclude annullata
    expect(m.fattureAperte).toBe(1);
    expect(m.daOrdinare).toBe(1);
  });

  it('aggrega acconti e provvigioni da incassare/pagare', () => {
    const deps: DepositResponse[] = [
      { deposit: { uuid: '1', date: '2026-01-01', seller: 'S', method: 'Contanti', amount: 30, collected: false }, client: 'A', uuid: 'b1' },
      { deposit: { uuid: '2', date: '2026-01-02', seller: 'S', method: 'Pos', amount: 20, collected: false }, client: 'B', uuid: 'b2' },
    ];
    const provs: ProvisionResponse[] = [
      { provision: { uuid: 'p1', seller: 'S', amount: 5, payed: false }, client: 'A', uuid: 'b1' },
    ];
    const m = computeDashboardMetrics([], deps, provs, []);
    expect(m.accontiDaIncassare).toEqual({ count: 2, total: 50 });
    expect(m.provvigioniDaPagare).toEqual({ count: 1, total: 5 });
  });

  it('segnala solo assegni in scadenza nella finestra', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    const far = new Date();
    far.setDate(far.getDate() + 200);
    const checks: Check[] = [
      { uuid: '1', make: 'A', expireDate: soon.toISOString().slice(0, 10), amount: 100, billNumbers: null },
      { uuid: '2', make: 'B', expireDate: far.toISOString().slice(0, 10), amount: 200, billNumbers: null },
      { uuid: '3', make: 'C', expireDate: '2000-01-01', amount: 50, billNumbers: null },
    ];
    const m = computeDashboardMetrics([], [], [], checks);
    expect(m.assegniInScadenza).toHaveLength(1);
    expect(m.assegniInScadenza[0].make).toBe('A');
  });

  it('aggrega vendite per venditore ordinate per fatturato', () => {
    const bills = [
      bill({ seller: 'A', totalPrice: 10 }),
      bill({ seller: 'B', totalPrice: 300 }),
      bill({ seller: 'A', totalPrice: 20 }),
    ];
    const m = computeDashboardMetrics(bills, [], [], []);
    expect(m.venditePerVenditore[0].seller).toBe('B');
    expect(m.venditePerVenditore[1]).toMatchObject({ seller: 'A', total: 30, count: 2 });
  });
});
