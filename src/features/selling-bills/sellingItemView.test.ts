import { describe, expect, it } from 'vitest';
import type { SellingBillItem } from '@/types/domain';
import { getSellingItemView } from './sellingItemView';

function item(name: string, price: number): SellingBillItem {
  return {
    uuid: 'item',
    name,
    price,
    ordered: false,
    company: '',
    arrived: false,
    delivered: false,
  };
}

describe('getSellingItemView', () => {
  it('decodifica codice, descrizione e quantità', () => {
    expect(getSellingItemView(item('Art. T01 · Tavolo rovere · Q.tà 2', 900))).toEqual({
      code: 'T01',
      description: 'Tavolo rovere',
      quantity: 2,
      unitPrice: 450,
      lineTotal: 900,
      structured: true,
    });
  });

  it('mantiene compatibilità con righe legacy', () => {
    expect(getSellingItemView(item('Divano angolare', 1590))).toEqual({
      code: '',
      description: 'Divano angolare',
      quantity: 1,
      unitPrice: 1590,
      lineTotal: 1590,
      structured: false,
    });
  });
});
