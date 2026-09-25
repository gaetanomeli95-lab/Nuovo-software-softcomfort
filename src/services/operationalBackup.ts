import { buyingBillsApi } from '@/services/api/buyingBills';
import { checksApi } from '@/services/api/checks';
import { depositsApi } from '@/services/api/deposits';
import { inventoryApi } from '@/services/api/inventory';
import { pendingApi } from '@/services/api/pending';
import { provisionsApi } from '@/services/api/provisions';
import { sellingBillsApi } from '@/services/api/sellingBills';

export interface OperationalBackupEnvelope {
  schemaVersion: 1;
  generatedAt: string;
  data: {
    sellingBills: unknown;
    buyingBills: unknown;
    inventoryAvailable: unknown;
    inventoryDelivered: unknown;
    checks: unknown;
    depositsToCollect: unknown;
    depositsCollected: unknown;
    provisionsToPay: unknown;
    provisionsPayed: unknown;
    pendingOrders: unknown;
  };
}

export function createOperationalBackupEnvelope(
  data: OperationalBackupEnvelope['data'],
  generatedAt = new Date().toISOString(),
): OperationalBackupEnvelope {
  return {
    schemaVersion: 1,
    generatedAt,
    data,
  };
}

export async function buildOperationalBackup(): Promise<OperationalBackupEnvelope> {
  const [
    sellingBills,
    buyingBills,
    inventoryAvailable,
    inventoryDelivered,
    checks,
    depositsToCollect,
    depositsCollected,
    provisionsToPay,
    provisionsPayed,
    pendingOrders,
  ] = await Promise.all([
    sellingBillsApi.getAll(),
    buyingBillsApi.getAll(),
    inventoryApi.getAllAvailable(),
    inventoryApi.getDelivered(),
    checksApi.getAll(),
    depositsApi.getToCollect(),
    depositsApi.getCollected(),
    provisionsApi.getToPay(),
    provisionsApi.getPayed(),
    pendingApi.getAll(),
  ]);

  return createOperationalBackupEnvelope({
    sellingBills,
    buyingBills,
    inventoryAvailable,
    inventoryDelivered,
    checks,
    depositsToCollect,
    depositsCollected,
    provisionsToPay,
    provisionsPayed,
    pendingOrders,
  });
}
