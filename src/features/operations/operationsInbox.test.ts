import { describe, expect, it } from 'vitest';
import type { Check, DepositResponse, ProvisionResponse, SellingBill } from '@/types/domain';
import { composeCommissionNotes } from '@/features/selling-bills/commissionMetadata';
import { buildOperationsInbox } from './operationsInbox';

function sale(overrides: Partial<SellingBill> = {}): SellingBill {
  return {
    uuid: 'sale',
    date: '2026-09-20',
    seller: 'Stefania',
    client: 'Cliente Demo',
    address: 'Palermo',
    phone: '',
    status: 'Da Ordinare',
    delivered: false,
    items: [{
      uuid: 'item',
      name: 'Articolo',
      price: 100,
      ordered: false,
      company: '',
      arrived: false,
      delivered: false,
    }],
    transport: 0,
    itemsPrice: 100,
    totalPrice: 100,
    settlement: 0,
    assistance: false,
    notes: '',
    deposits: [],
    provision: null,
    ...overrides,
  };
}

describe('operations inbox', () => {
  it('porta consegne urgenti e vendite da ordinare nel posto giusto', () => {
    const planned = sale({
      uuid: 'planned',
      status: 'Pronta',
      notes: composeCommissionNotes({
        city: 'Palermo',
        floor: '',
        staircase: '',
        elevator: '',
        measureSource: '',
        hoist: '',
        attachments: '',
        attachmentPages: null,
        scheduledDate: '2026-09-24',
        scheduledTime: '10:00',
      }, ''),
    });

    const out = buildOperationsInbox([planned, sale({ uuid: 'order' })], [], [], [], '2026-09-25');
    expect(out.urgent[0].id).toBe('delivery-planned');
    expect(out.urgent[0].priority).toBe('critical');
    expect(out.sales.some((item) => item.id === 'order-order')).toBe(true);
  });

  it('include acconti, provvigioni e assegni in scadenza', () => {
    const deposits: DepositResponse[] = [{
      uuid: 'sale',
      client: 'Mario',
      deposit: {
        uuid: 'd1',
        date: '2026-09-25',
        seller: 'S',
        method: 'Pos',
        amount: 50,
        collected: false,
      },
    }];
    const provisions: ProvisionResponse[] = [{
      uuid: 'sale',
      client: 'Mario',
      provision: { uuid: 'p1', seller: 'S', amount: 10, payed: false },
    }];
    const checks: Check[] = [{
      uuid: 'c1',
      make: 'Mario',
      expireDate: new Date().toISOString().slice(0, 10),
      amount: 100,
      billNumbers: null,
    }];

    const out = buildOperationsInbox([], deposits, provisions, checks);
    expect(out.collections).toHaveLength(1);
    expect(out.administration).toHaveLength(1);
    expect(out.urgent.some((item) => item.id === 'check-c1')).toBe(true);
  });
});
