import { describe, expect, it } from 'vitest';
import type { SellingBill } from '@/types/domain';
import { composeCommissionNotes } from './commissionMetadata';
import { deliveryCounts, getDeliveryEntries } from './deliveryPlanning';

function bill(overrides: Partial<SellingBill>): SellingBill {
  return {
    uuid: 'sale',
    date: '2026-09-20',
    seller: 'Stefania',
    client: 'Cliente Demo',
    address: 'Palermo',
    phone: '',
    status: 'Pronta',
    delivered: false,
    items: [],
    transport: 0,
    itemsPrice: 1000,
    totalPrice: 1000,
    settlement: 0,
    assistance: false,
    notes: '',
    deposits: [],
    provision: null,
    ...overrides,
  };
}

function planned(
  uuid: string,
  scheduledDate: string,
  status: SellingBill['status'] = 'Pronta',
): SellingBill {
  return bill({
    uuid,
    status,
    delivered: status === 'Consegnata' || status === 'Chiusa',
    notes: composeCommissionNotes({
      city: 'Palermo',
      floor: '',
      staircase: '',
      elevator: '',
      measureSource: '',
      hoist: '',
      attachments: '',
      attachmentPages: null,
      scheduledDate,
      scheduledTime: '10:00',
    }, ''),
  });
}

describe('delivery planning', () => {
  it('classifica ritardi, oggi, future e completate', () => {
    const entries = getDeliveryEntries([
      planned('late', '2026-09-24'),
      planned('today', '2026-09-25'),
      planned('future', '2026-09-27'),
      planned('done', '2026-09-23', 'Consegnata'),
    ], '2026-09-25');

    expect(entries.map((entry) => entry.state)).toEqual([
      'late',
      'today',
      'upcoming',
      'completed',
    ]);
    expect(deliveryCounts(entries)).toEqual({
      late: 1,
      today: 1,
      upcoming: 1,
      completed: 1,
    });
  });

  it('ignora fatture annullate e vendite senza data programmata', () => {
    const noDate = bill({
      uuid: 'no-date',
      notes: composeCommissionNotes({
        city: '',
        floor: '',
        staircase: '',
        elevator: '',
        measureSource: '',
        hoist: '',
        attachments: '',
        attachmentPages: null,
        scheduledDate: '',
        scheduledTime: '',
      }, ''),
    });
    const cancelled = planned('cancelled', '2026-09-26', 'Annullata');

    expect(getDeliveryEntries([noDate, cancelled], '2026-09-25')).toEqual([]);
  });
});
