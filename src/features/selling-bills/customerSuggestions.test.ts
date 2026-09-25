import { describe, expect, it } from 'vitest';
import { buildCustomerSuggestions } from './customerSuggestions';
import type { SellingBill } from '@/types/domain';

function bill(overrides: Partial<SellingBill>): SellingBill {
  return {
    uuid: 'sale-' + Math.random(),
    date: '2026-09-20',
    seller: 'Stefania',
    client: 'Mario Rossi',
    address: 'Via Roma 1, Palermo',
    phone: '333 111 2222',
    status: 'Chiusa',
    delivered: true,
    items: [],
    transport: 0,
    itemsPrice: 0,
    totalPrice: 100,
    settlement: 0,
    assistance: false,
    notes: '',
    deposits: [],
    provision: null,
    ...overrides,
  };
}

describe('customer suggestions', () => {
  it('deduplicates customers and keeps the most recent contact data', () => {
    const suggestions = buildCustomerSuggestions([
      bill({ uuid: 'old', date: '2026-01-01', client: 'Mario Rossi', phone: '3330000000' }),
      bill({ uuid: 'new', date: '2026-09-20', client: 'Mario Rossi', phone: '3339999999' }),
    ], 'mario');

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toMatchObject({
      name: 'Mario Rossi',
      phone: '3339999999',
      saleCount: 2,
      lastDate: '2026-09-20',
    });
  });

  it('matches accents and contact fields', () => {
    const suggestions = buildCustomerSuggestions([
      bill({ client: 'José Bianchi', phone: '3925551234' }),
    ], 'jose');

    expect(suggestions[0]?.name).toBe('José Bianchi');
    expect(buildCustomerSuggestions([
      bill({ client: 'Giulia Verdi', phone: '3925551234' }),
    ], '5551')[0]?.name).toBe('Giulia Verdi');
  });

  it('requires at least two search characters', () => {
    expect(buildCustomerSuggestions([bill({})], 'm')).toEqual([]);
  });
});
