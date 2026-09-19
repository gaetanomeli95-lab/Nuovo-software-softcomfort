import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS, filterBills, paginate, sortBills, sumTotal,
  totalPages, uniqueSellers,
} from './billFilters';
import type { SellingBill } from '@/types/domain';

const bill = (over: Partial<SellingBill>): SellingBill => ({
  uuid: Math.random().toString(36).slice(2),
  date: '2026-01-01',
  seller: 'Stefania',
  client: 'Mario Rossi',
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

const bills: SellingBill[] = [
  bill({ client: 'Rossi Mario', seller: 'Stefania', status: 'Chiusa', totalPrice: 100, date: '2026-01-10' }),
  bill({ client: 'Bianchi Anna', seller: 'Giuseppe', status: 'Da Ordinare', totalPrice: 250, date: '2026-03-05' }),
  bill({ client: 'Verdi Luca', seller: 'Stefania', status: 'Annullata', totalPrice: 80, date: '2026-02-01' }),
  bill({ client: 'Neri Paolo', seller: 'Benny', status: 'Ordinato', totalPrice: 40, date: '2026-02-20' }),
];

describe('filterBills', () => {
  it('filtra per testo su cliente', () => {
    const out = filterBills(bills, { ...DEFAULT_FILTERS, search: 'bianchi' });
    expect(out).toHaveLength(1);
    expect(out[0].client).toBe('Bianchi Anna');
  });
  it('filtra per testo su articoli', () => {
    const withItem = bill({ client: 'X', items: [{ uuid: '1', name: 'rete singola', price: 70, ordered: true, company: '', arrived: true, delivered: true }] });
    const out = filterBills([withItem, ...bills], { ...DEFAULT_FILTERS, search: 'rete' });
    expect(out).toHaveLength(1);
  });
  it('filtra per stato', () => {
    expect(filterBills(bills, { ...DEFAULT_FILTERS, status: 'Ordinato' })).toHaveLength(1);
  });
  it('filtra per venditore', () => {
    expect(filterBills(bills, { ...DEFAULT_FILTERS, seller: 'Stefania' })).toHaveLength(2);
  });
  it('filtra per intervallo date', () => {
    const out = filterBills(bills, { ...DEFAULT_FILTERS, dateFrom: '2026-02-01', dateTo: '2026-02-28' });
    expect(out).toHaveLength(2);
  });
  it('combina filtri', () => {
    const out = filterBills(bills, { ...DEFAULT_FILTERS, seller: 'Stefania', status: 'Chiusa' });
    expect(out).toHaveLength(1);
  });
});

describe('sortBills', () => {
  it('ordina per data desc', () => {
    const out = sortBills(bills, 'date', 'desc');
    expect(out[0].date).toBe('2026-03-05');
  });
  it('ordina per totale asc', () => {
    const out = sortBills(bills, 'totalPrice', 'asc');
    expect(out[0].totalPrice).toBe(40);
  });
  it('ordina per cliente', () => {
    const out = sortBills(bills, 'client', 'asc');
    expect(out[0].client).toBe('Bianchi Anna');
  });
});

describe('uniqueSellers', () => {
  it('estrae venditori unici ordinati', () => {
    expect(uniqueSellers(bills)).toEqual(['Benny', 'Giuseppe', 'Stefania']);
  });
});

describe('sumTotal', () => {
  it('somma escludendo le annullate', () => {
    expect(sumTotal(bills)).toBe(390);
  });
});

describe('paginate / totalPages', () => {
  it('pagina correttamente', () => {
    const items = Array.from({ length: 60 }, (_, i) => i);
    expect(paginate(items, 0, 25)).toHaveLength(25);
    expect(paginate(items, 2, 25)).toHaveLength(10);
    expect(totalPages(60, 25)).toBe(3);
    expect(totalPages(0, 25)).toBe(1);
  });
});
