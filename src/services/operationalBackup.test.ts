import { describe, expect, it } from 'vitest';
import { createOperationalBackupEnvelope } from './operationalBackup';

describe('operational backup envelope', () => {
  it('wraps exported data with a stable schema version and timestamp', () => {
    const generatedAt = '2026-09-25T01:00:00.000Z';
    const data = {
      sellingBills: [{ uuid: 'sale-1' }],
      buyingBills: [],
      inventoryAvailable: [],
      inventoryDelivered: [],
      checks: [],
      depositsToCollect: { depositResponses: [] },
      depositsCollected: { depositResponses: [] },
      provisionsToPay: { provisionResponses: [] },
      provisionsPayed: { provisionResponses: [] },
      pendingOrders: [],
    };

    expect(createOperationalBackupEnvelope(data, generatedAt)).toEqual({
      schemaVersion: 1,
      generatedAt,
      data,
    });
  });
});
