import { describe, expect, it } from 'vitest';
import type { SellingBill } from '@/types/domain';
import { getPaymentSummary, getSaleClosureReadiness } from './paymentStatus';

function bill(overrides: Partial<SellingBill> = {}): SellingBill {
  return {
    uuid: 'sale',
    date: '2026-09-25',
    seller: 'Stefania',
    client: 'Cliente',
    address: '',
    phone: '',
    status: 'Consegnata',
    delivered: true,
    items: [{
      uuid: 'item-1',
      name: 'Articolo',
      price: 1000,
      ordered: true,
      company: '',
      arrived: true,
      delivered: true,
    }],
    transport: 0,
    itemsPrice: 1000,
    totalPrice: 1000,
    settlement: 500,
    assistance: false,
    notes: '',
    deposits: [],
    provision: null,
    ...overrides,
  };
}

describe('getPaymentSummary', () => {
  it('considera solo gli acconti marcati collected', () => {
    const value = bill({
      deposits: [
        { uuid: 'd1', date: '2026-09-20', seller: 'S', method: 'Pos', amount: 400, collected: true },
        { uuid: 'd2', date: '2026-09-21', seller: 'S', method: 'Bonifico', amount: 600, collected: false },
      ],
    });

    expect(getPaymentSummary(value)).toEqual({
      paidTotal: 400,
      balance: 600,
      status: 'Parziale',
    });
  });

  it('non usa settlement come pagamento finché la semantica legacy non è validata', () => {
    expect(getPaymentSummary(bill({ settlement: 1000, deposits: [] })).status).toBe('Da pagare');
  });

  it('marca pagata quando gli incassi coprono il totale', () => {
    const value = bill({
      deposits: [
        { uuid: 'd1', date: '2026-09-20', seller: 'S', method: 'Pos', amount: 1000, collected: true },
      ],
    });
    expect(getPaymentSummary(value).status).toBe('Pagata');
  });
});

describe('getSaleClosureReadiness', () => {
  it('è pronta solo con articoli consegnati e pagamento completo', () => {
    const value = bill({
      deposits: [
        { uuid: 'd1', date: '2026-09-20', seller: 'S', method: 'Pos', amount: 1000, collected: true },
      ],
    });
    expect(getSaleClosureReadiness(value).ready).toBe(true);
  });

  it('spiega cosa manca senza modificare lo stato della vendita', () => {
    const value = bill({
      items: [{
        uuid: 'item-1',
        name: 'Articolo',
        price: 1000,
        ordered: true,
        company: '',
        arrived: true,
        delivered: false,
      }],
      deposits: [],
    });
    const readiness = getSaleClosureReadiness(value);
    expect(readiness.ready).toBe(false);
    expect(readiness.reasons).toContain('Merce non ancora interamente consegnata');
    expect(readiness.reasons).toContain('Pagamento non ancora completato');
  });
});
